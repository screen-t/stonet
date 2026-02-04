# TASK: BE-005 - Phone Authentication with OTP

**Assigned To:** Backend Developer  
**Priority:** MEDIUM  
**Estimate:** 8 hours  
**Deadline:** February 10, 2026  
**Status:** Not Started  
**Dependencies:** BE-003 (Email/Password Authentication)  
**Created:** February 5, 2026

---

## Objective

Implement phone number authentication with SMS-based OTP (One-Time Password) verification using Supabase Auth.

## Prerequisites

- BE-003 (Email/Password Authentication) completed
- Supabase project with Phone Auth enabled
- SMS provider configured (Twilio recommended)
- Phone number validation knowledge

## Instructions

### Step 1: Enable Phone Auth in Supabase

1. Go to Supabase Dashboard > Authentication > Settings
2. Enable "Phone" as an authentication method
3. Configure SMS provider (Twilio):
   - Add Twilio Account SID and Auth Token
   - Configure sender phone number
   - Set up templates for OTP messages

### Step 2: Phone Auth Models (models/auth.py)

Add these models to your existing auth models:

```python
from pydantic import BaseModel, validator
import re

class PhoneSignupRequest(BaseModel):
    phone: str
    
    @validator('phone')
    def validate_phone(cls, v):
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', v)
        
        # Check if it's a valid phone number (10-15 digits)
        if len(digits_only) < 10 or len(digits_only) > 15:
            raise ValueError('Phone number must be between 10 and 15 digits')
        
        # Add + prefix if not present
        if not v.startswith('+'):
            return f'+{digits_only}'
        return v

class PhoneSignupResponse(BaseModel):
    message: str
    phone: str
    
class OTPVerificationRequest(BaseModel):
    phone: str
    otp: str
    
    @validator('otp')
    def validate_otp(cls, v):
        if len(v) != 6 or not v.isdigit():
            raise ValueError('OTP must be 6 digits')
        return v

class OTPVerificationResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict
    expires_in: int
```

### Step 3: Phone Auth Helper Functions (lib/auth_helpers.py)

Add these functions to your existing auth_helpers.py:

```python
from supabase import Client
import re
import logging

logger = logging.getLogger(__name__)

def normalize_phone_number(phone: str) -> str:
    """Normalize phone number to E.164 format"""
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)
    
    # Add country code if missing (assume US +1 if no country code)
    if len(digits_only) == 10:
        digits_only = '1' + digits_only
    
    return f'+{digits_only}'

async def send_phone_otp(supabase: Client, phone: str) -> dict:
    """Send OTP to phone number"""
    try:
        normalized_phone = normalize_phone_number(phone)
        logger.info(f"Sending OTP to phone: {normalized_phone}")
        
        result = supabase.auth.sign_in_with_otp({
            'phone': normalized_phone
        })
        
        return {
            'success': True,
            'message': 'OTP sent successfully',
            'phone': normalized_phone
        }
    except Exception as e:
        logger.error(f"Failed to send OTP to {phone}: {str(e)}")
        raise Exception(f"Failed to send OTP: {str(e)}")

async def verify_phone_otp(supabase: Client, phone: str, otp: str) -> dict:
    """Verify OTP and complete phone authentication"""
    try:
        normalized_phone = normalize_phone_number(phone)
        logger.info(f"Verifying OTP for phone: {normalized_phone}")
        
        result = supabase.auth.verify_otp({
            'phone': normalized_phone,
            'token': otp,
            'type': 'sms'
        })
        
        if not result.user:
            raise Exception("OTP verification failed")
        
        # Create or update user profile
        user_data = {
            'id': result.user.id,
            'phone': normalized_phone,
            'email': result.user.email,
            'phone_confirmed_at': result.user.phone_confirmed_at,
            'last_sign_in_at': result.user.last_sign_in_at
        }
        
        # Check if user profile exists
        existing_user = supabase.table('users').select('*').eq('id', result.user.id).execute()
        
        if not existing_user.data:
            # Create new user profile
            profile_data = {
                'id': result.user.id,
                'phone': normalized_phone,
                'username': f"user_{result.user.id[:8]}",  # Generate temporary username
                'first_name': '',
                'last_name': '',
                'created_at': datetime.utcnow().isoformat()
            }
            
            supabase.table('users').insert(profile_data).execute()
            logger.info(f"Created user profile for phone: {normalized_phone}")
        
        return {
            'access_token': result.session.access_token,
            'refresh_token': result.session.refresh_token,
            'user': user_data,
            'expires_in': result.session.expires_in
        }
    
    except Exception as e:
        logger.error(f"Failed to verify OTP for {phone}: {str(e)}")
        raise Exception(f"OTP verification failed: {str(e)}")
```

### Step 4: Phone Auth Endpoints (routes/auth.py)

Add these endpoints to your existing auth.py routes:

```python
from app.models.auth import (
    PhoneSignupRequest, PhoneSignupResponse,
    OTPVerificationRequest, OTPVerificationResponse
)
from app.lib.auth_helpers import send_phone_otp, verify_phone_otp

@router.post("/signup/phone", response_model=PhoneSignupResponse)
async def signup_with_phone(
    request: PhoneSignupRequest,
    supabase: Client = Depends(get_supabase_client)
):
    """Send OTP to phone number for signup"""
    try:
        result = await send_phone_otp(supabase, request.phone)
        return PhoneSignupResponse(
            message=result['message'],
            phone=result['phone']
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify/phone", response_model=OTPVerificationResponse)
async def verify_phone_otp_endpoint(
    request: OTPVerificationRequest,
    supabase: Client = Depends(get_supabase_client)
):
    """Verify OTP and complete phone authentication"""
    try:
        result = await verify_phone_otp(supabase, request.phone, request.otp)
        return OTPVerificationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/resend-otp")
async def resend_phone_otp(
    request: PhoneSignupRequest,
    supabase: Client = Depends(get_supabase_client)
):
    """Resend OTP to phone number"""
    try:
        result = await send_phone_otp(supabase, request.phone)
        return {
            'message': 'OTP resent successfully',
            'phone': result['phone']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### Step 5: Rate Limiting (middleware/rate_limit.py)

Create rate limiting for OTP requests:

```python
from fastapi import HTTPException, Request
from collections import defaultdict
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Simple in-memory rate limiting (use Redis in production)
rate_limit_store = defaultdict(list)

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
    
    def is_allowed(self, identifier: str) -> bool:
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        # Clean old entries
        rate_limit_store[identifier] = [
            timestamp for timestamp in rate_limit_store[identifier]
            if timestamp > window_start
        ]
        
        # Check if under limit
        if len(rate_limit_store[identifier]) >= self.max_requests:
            return False
        
        # Add current request
        rate_limit_store[identifier].append(now)
        return True

# Rate limiter instances
otp_rate_limiter = RateLimiter(max_requests=3, window_seconds=300)  # 3 OTPs per 5 minutes

def check_otp_rate_limit(phone: str):
    """Check if phone number is within OTP rate limit"""
    if not otp_rate_limiter.is_allowed(phone):
        logger.warning(f"Rate limit exceeded for phone: {phone}")
        raise HTTPException(
            status_code=429,
            detail="Too many OTP requests. Please wait before trying again."
        )
```

### Step 6: Update Phone Auth Routes with Rate Limiting

Update your phone auth endpoints to include rate limiting:

```python
from app.middleware.rate_limit import check_otp_rate_limit

@router.post("/signup/phone", response_model=PhoneSignupResponse)
async def signup_with_phone(
    request: PhoneSignupRequest,
    supabase: Client = Depends(get_supabase_client)
):
    """Send OTP to phone number for signup"""
    # Check rate limit
    check_otp_rate_limit(request.phone)
    
    try:
        result = await send_phone_otp(supabase, request.phone)
        return PhoneSignupResponse(
            message=result['message'],
            phone=result['phone']
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### Step 7: Testing

Create test cases for phone authentication:

```python
# tests/test_phone_auth.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_send_phone_otp():
    """Test sending OTP to phone"""
    response = client.post("/auth/signup/phone", json={
        "phone": "+1234567890"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "phone" in data
    assert data["phone"] == "+11234567890"

def test_verify_phone_otp():
    """Test verifying OTP (use test OTP in development)"""
    # First send OTP
    client.post("/auth/signup/phone", json={
        "phone": "+1234567890"
    })
    
    # Then verify (use development test OTP)
    response = client.post("/auth/verify/phone", json={
        "phone": "+1234567890",
        "otp": "123456"  # Use actual OTP from SMS in real testing
    })
    
    if response.status_code == 200:
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "user" in data

def test_phone_validation():
    """Test phone number validation"""
    # Invalid phone number
    response = client.post("/auth/signup/phone", json={
        "phone": "123"
    })
    assert response.status_code == 422
```

## Deliverables

- [ ] Supabase phone auth configured
- [ ] Phone number validation implemented
- [ ] Send OTP endpoint working
- [ ] Verify OTP endpoint working
- [ ] Rate limiting implemented
- [ ] User profile creation on phone signup
- [ ] Error handling for SMS failures
- [ ] Test cases written and passing

## Acceptance Criteria

1. **OTP Sending:**
   - Phone numbers are properly validated and normalized
   - SMS OTP sent successfully to valid phone numbers
   - Rate limiting prevents spam (max 3 OTPs per 5 minutes)
   - Clear error messages for invalid phone numbers

2. **OTP Verification:**
   - 6-digit OTP verified correctly
   - JWT tokens issued upon successful verification
   - User profile created automatically
   - Proper error handling for invalid/expired OTPs

3. **Security:**
   - Rate limiting implemented
   - Phone numbers stored in E.164 format
   - No sensitive data in error messages
   - OTP tokens expire appropriately

4. **Integration:**
   - Works with existing authentication system
   - Consistent response format with email auth
   - Proper logging for debugging

## Environment Variables Required

```bash
# Add to .env file
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Testing Commands

```bash
# Run phone auth tests
pytest tests/test_phone_auth.py -v

# Test with curl
curl -X POST http://localhost:8002/auth/signup/phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# Verify OTP
curl -X POST http://localhost:8002/auth/verify/phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "otp": "123456"}'
```

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Backend Lead:** [TBD]
- **Technical Lead:** [TBD]

## Next Steps After Completion

1. Test SMS delivery in staging environment
2. Document phone auth API for frontend team
3. Integrate with FE-002 (Authentication UI)
4. Set up monitoring for SMS costs
5. Consider implementing WhatsApp OTP as alternative

---

**Status Updates:**
- [ ] Started: _________
- [ ] Supabase Phone Auth Configured: _________
- [ ] Send OTP Endpoint Complete: _________
- [ ] Verify OTP Endpoint Complete: _________
- [ ] Rate Limiting Implemented: _________
- [ ] Testing Complete: _________
- [ ] Completed: _________
- [ ] Frontend Team Notified: _________