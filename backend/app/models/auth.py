from pydantic import BaseModel, EmailStr, validator, Field
import re

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    username: str = Field(..., min_length=3, max_length=30)
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v.lower()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LogoutRequest(BaseModel):
    refresh_token: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    access_token: str
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v
