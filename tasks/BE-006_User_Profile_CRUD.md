# TASK: BE-006 - User Profile CRUD API

**Assigned To:** Backend Lead + Backend Developer  
**Priority:** HIGH  
**Estimate:** 12 hours  
**Deadline:** February 8, 2026  
**Status:** Not Started  
**Dependencies:** BE-003 (Email/Password Authentication), DB-002A (Database Migration)  
**Created:** February 5, 2026

---

## Objective

Implement comprehensive user profile CRUD (Create, Read, Update, Delete) endpoints that allow users to manage their profile information, including personal details, work experience, and education.

## Prerequisites

- BE-003 (Email/Password Authentication) completed
- DB-002A (Database Migration) completed
- Understanding of Supabase Row Level Security (RLS)
- Knowledge of user authentication patterns

## Instructions

### Step 1: Profile Models (models/profile.py)

Create comprehensive profile models:

```python
from pydantic import BaseModel, validator, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EducationLevel(str, Enum):
    HIGH_SCHOOL = "high_school"
    ASSOCIATE = "associate"
    BACHELOR = "bachelor"
    MASTER = "master"
    DOCTORATE = "doctorate"
    CERTIFICATE = "certificate"
    OTHER = "other"

class WorkExperience(BaseModel):
    id: Optional[int] = None
    company_name: str
    position_title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    location: Optional[str] = None
    
    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and v < values['start_date']:
            raise ValueError('End date cannot be before start date')
        return v
    
    @validator('is_current')
    def validate_current(cls, v, values):
        if v and 'end_date' in values and values['end_date']:
            raise ValueError('Current position cannot have an end date')
        return v

class Education(BaseModel):
    id: Optional[int] = None
    institution_name: str
    degree: str
    field_of_study: Optional[str] = None
    level: EducationLevel
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    gpa: Optional[float] = None
    description: Optional[str] = None
    
    @validator('gpa')
    def validate_gpa(cls, v):
        if v is not None and (v < 0.0 or v > 4.0):
            raise ValueError('GPA must be between 0.0 and 4.0')
        return v

class UserProfileBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    avatar_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_verified: Optional[bool] = False
    is_public: Optional[bool] = True
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3 or len(v) > 30:
            raise ValueError('Username must be between 3 and 30 characters')
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, hyphens, and underscores')
        return v.lower()
    
    @validator('bio')
    def validate_bio(cls, v):
        if v and len(v) > 500:
            raise ValueError('Bio cannot exceed 500 characters')
        return v

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    is_public: Optional[bool] = None
    
class UserProfileResponse(UserProfileBase):
    id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_active_at: Optional[datetime] = None
    work_experience: Optional[List[WorkExperience]] = []
    education: Optional[List[Education]] = []
    
    class Config:
        from_attributes = True

class PublicProfileResponse(BaseModel):
    id: str
    username: str
    first_name: str
    last_name: str
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    avatar_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_verified: bool = False
    work_experience: Optional[List[WorkExperience]] = []
    education: Optional[List[Education]] = []
    created_at: datetime
```

### Step 2: Profile Helper Functions (lib/profile_helpers.py)

```python
from supabase import Client
from app.models.profile import UserProfileResponse, WorkExperience, Education
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

async def get_user_profile(supabase: Client, user_id: str) -> Optional[dict]:
    """Get complete user profile with work experience and education"""
    try:
        # Get main profile
        profile_result = supabase.table('users').select('*').eq('id', user_id).execute()
        
        if not profile_result.data:
            return None
        
        profile = profile_result.data[0]
        
        # Get work experience
        work_result = supabase.table('work_experience')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('start_date', desc=True)\
            .execute()
        
        # Get education
        education_result = supabase.table('education')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('start_date', desc=True)\
            .execute()
        
        profile['work_experience'] = work_result.data or []
        profile['education'] = education_result.data or []
        
        return profile
        
    except Exception as e:
        logger.error(f"Error fetching user profile {user_id}: {str(e)}")
        raise Exception(f"Failed to fetch profile: {str(e)}")

async def update_user_profile(supabase: Client, user_id: str, profile_data: dict) -> dict:
    """Update user profile information"""
    try:
        # Update main profile
        result = supabase.table('users')\
            .update(profile_data)\
            .eq('id', user_id)\
            .execute()
        
        if not result.data:
            raise Exception("Profile update failed")
        
        return result.data[0]
        
    except Exception as e:
        logger.error(f"Error updating user profile {user_id}: {str(e)}")
        raise Exception(f"Failed to update profile: {str(e)}")

async def check_username_availability(supabase: Client, username: str, exclude_user_id: str = None) -> bool:
    """Check if username is available"""
    try:
        query = supabase.table('users').select('id').eq('username', username.lower())
        
        if exclude_user_id:
            query = query.neq('id', exclude_user_id)
        
        result = query.execute()
        return len(result.data) == 0
        
    except Exception as e:
        logger.error(f"Error checking username availability: {str(e)}")
        return False

async def add_work_experience(supabase: Client, user_id: str, work_data: dict) -> dict:
    """Add work experience entry"""
    try:
        work_data['user_id'] = user_id
        result = supabase.table('work_experience').insert(work_data).execute()
        
        if not result.data:
            raise Exception("Failed to add work experience")
        
        return result.data[0]
        
    except Exception as e:
        logger.error(f"Error adding work experience for user {user_id}: {str(e)}")
        raise Exception(f"Failed to add work experience: {str(e)}")

async def update_work_experience(supabase: Client, user_id: str, work_id: int, work_data: dict) -> dict:
    """Update work experience entry"""
    try:
        result = supabase.table('work_experience')\
            .update(work_data)\
            .eq('id', work_id)\
            .eq('user_id', user_id)\
            .execute()
        
        if not result.data:
            raise Exception("Work experience not found or update failed")
        
        return result.data[0]
        
    except Exception as e:
        logger.error(f"Error updating work experience {work_id}: {str(e)}")
        raise Exception(f"Failed to update work experience: {str(e)}")

async def delete_work_experience(supabase: Client, user_id: str, work_id: int) -> bool:
    """Delete work experience entry"""
    try:
        result = supabase.table('work_experience')\
            .delete()\
            .eq('id', work_id)\
            .eq('user_id', user_id)\
            .execute()
        
        return len(result.data) > 0
        
    except Exception as e:
        logger.error(f"Error deleting work experience {work_id}: {str(e)}")
        return False

# Similar functions for education...
async def add_education(supabase: Client, user_id: str, education_data: dict) -> dict:
    """Add education entry"""
    try:
        education_data['user_id'] = user_id
        result = supabase.table('education').insert(education_data).execute()
        
        if not result.data:
            raise Exception("Failed to add education")
        
        return result.data[0]
        
    except Exception as e:
        logger.error(f"Error adding education for user {user_id}: {str(e)}")
        raise Exception(f"Failed to add education: {str(e)}")
```

### Step 3: Profile API Endpoints (routes/profile.py)

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from app.lib.supabase import get_supabase_client
from app.lib.auth_helpers import get_current_user
from app.lib.profile_helpers import (
    get_user_profile, update_user_profile, 
    check_username_availability, add_work_experience,
    update_work_experience, delete_work_experience, add_education
)
from app.models.profile import (
    UserProfileResponse, UserProfileUpdate, PublicProfileResponse,
    WorkExperience, Education
)
from typing import List

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Get current user's complete profile"""
    try:
        profile = await get_user_profile(supabase, current_user['id'])
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return UserProfileResponse(**profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/me", response_model=UserProfileResponse)
async def update_my_profile(
    profile_update: UserProfileUpdate,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Update current user's profile"""
    try:
        # Check username availability if username is being updated
        update_data = profile_update.dict(exclude_unset=True)
        
        if 'username' in update_data:
            username = update_data['username']
            if not await check_username_availability(supabase, username, current_user['id']):
                raise HTTPException(status_code=400, detail="Username already taken")
        
        # Update profile
        updated_profile = await update_user_profile(supabase, current_user['id'], update_data)
        
        # Get complete profile with relations
        complete_profile = await get_user_profile(supabase, current_user['id'])
        return UserProfileResponse(**complete_profile)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{username}", response_model=PublicProfileResponse)
async def get_public_profile(
    username: str,
    supabase: Client = Depends(get_supabase_client)
):
    """Get public profile by username"""
    try:
        # Find user by username
        user_result = supabase.table('users')\
            .select('*')\
            .eq('username', username.lower())\
            .eq('is_public', True)\
            .execute()
        
        if not user_result.data:
            raise HTTPException(status_code=404, detail="Profile not found or private")
        
        user_id = user_result.data[0]['id']
        profile = await get_user_profile(supabase, user_id)
        
        return PublicProfileResponse(**profile)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/check-username/{username}")
async def check_username(
    username: str,
    supabase: Client = Depends(get_supabase_client)
):
    """Check if username is available"""
    try:
        is_available = await check_username_availability(supabase, username)
        return {
            "username": username.lower(),
            "available": is_available
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Work Experience endpoints
@router.post("/work-experience", response_model=WorkExperience)
async def add_work(
    work: WorkExperience,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Add work experience"""
    try:
        work_data = work.dict(exclude={'id'})
        result = await add_work_experience(supabase, current_user['id'], work_data)
        return WorkExperience(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/work-experience/{work_id}", response_model=WorkExperience)
async def update_work(
    work_id: int,
    work_update: WorkExperience,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Update work experience"""
    try:
        work_data = work_update.dict(exclude_unset=True, exclude={'id'})
        result = await update_work_experience(supabase, current_user['id'], work_id, work_data)
        return WorkExperience(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/work-experience/{work_id}")
async def delete_work(
    work_id: int,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Delete work experience"""
    try:
        success = await delete_work_experience(supabase, current_user['id'], work_id)
        if not success:
            raise HTTPException(status_code=404, detail="Work experience not found")
        return {"message": "Work experience deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Education endpoints (similar pattern)
@router.post("/education", response_model=Education)
async def add_education_endpoint(
    education: Education,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Add education"""
    try:
        education_data = education.dict(exclude={'id'})
        result = await add_education(supabase, current_user['id'], education_data)
        return Education(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Step 4: Update main.py to include profile routes

```python
# Add to main.py
from app.routes import profile

# Include the router
app.include_router(profile.router)
```

### Step 5: Authentication Dependency (lib/auth_helpers.py)

Add user authentication dependency:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from supabase import Client

security = HTTPBearer()

async def get_current_user(
    token: str = Depends(security),
    supabase: Client = Depends(get_supabase_client)
):
    """Get current authenticated user from JWT token"""
    try:
        # Verify token with Supabase
        user = supabase.auth.get_user(token.credentials)
        
        if not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

## Deliverables

- [ ] User profile models created (profile.py)
- [ ] Profile helper functions implemented
- [ ] GET /profile/me endpoint (authenticated user profile)
- [ ] PATCH /profile/me endpoint (update profile)
- [ ] GET /profile/{username} endpoint (public profile)
- [ ] Username availability check endpoint
- [ ] Work experience CRUD endpoints
- [ ] Education CRUD endpoints
- [ ] Authentication middleware integrated
- [ ] Input validation and error handling
- [ ] Test cases for all endpoints

## Acceptance Criteria

1. **Profile Management:**
   - Users can view their complete profile
   - Users can update their profile information
   - Username uniqueness is enforced
   - Profile validation works correctly

2. **Public Profiles:**
   - Public profiles accessible by username
   - Private profiles are protected
   - Public profiles show appropriate information

3. **Work Experience:**
   - Users can add, update, and delete work experience
   - Date validation works properly
   - Current position logic is correct

4. **Education:**
   - Users can manage education entries
   - GPA validation works (0.0-4.0)
   - Proper date handling

5. **Security:**
   - All endpoints require authentication (except public profiles)
   - Users can only modify their own data
   - Proper error handling and validation

## API Documentation

### Main Endpoints:
- `GET /profile/me` - Get authenticated user's profile
- `PATCH /profile/me` - Update user profile
- `GET /profile/{username}` - Get public profile
- `GET /profile/check-username/{username}` - Check username availability
- `POST /profile/work-experience` - Add work experience
- `PATCH /profile/work-experience/{id}` - Update work experience
- `DELETE /profile/work-experience/{id}` - Delete work experience
- `POST /profile/education` - Add education
- `PATCH /profile/education/{id}` - Update education
- `DELETE /profile/education/{id}` - Delete education

## Testing Commands

```bash
# Test profile endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8002/profile/me

# Update profile
curl -X PATCH \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Doe"}' \
  http://localhost:8002/profile/me

# Check username availability
curl http://localhost:8002/profile/check-username/johndoe
```

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Backend Lead:** [TBD]
- **Technical Lead:** [TBD]

## Next Steps After Completion

1. Test all endpoints thoroughly
2. Share API documentation with frontend team
3. Begin FE-004 (Profile UI Components)
4. Set up profile image upload system
5. Implement profile completion tracking

---

**Status Updates:**
- [ ] Started: _________
- [ ] Models Created: _________
- [ ] Helper Functions Complete: _________
- [ ] Main Profile Endpoints: _________
- [ ] Work Experience CRUD: _________
- [ ] Education CRUD: _________
- [ ] Testing Complete: _________
- [ ] Completed: _________
- [ ] Frontend Team Notified: _________