from fastapi import APIRouter, HTTPException, Depends, Request
from app.lib.supabase import supabase
from app.middleware.auth import require_auth
from app.models.auth import (
    SignupRequest, LoginRequest, LogoutRequest, 
    RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from app.lib.auth_helpers import check_username_availability, track_login_activity, deactivate_session

router = APIRouter(prefix="/auth", tags=["Auth"])

# Signup Api
@router.post("/signup")
def signup(payload: SignupRequest, request: Request):
    # Check username availability
    if not check_username_availability(payload.username):
        raise HTTPException(
            status_code=409,
            detail="Username already taken"
        )

    # Create auth user
    auth_res = supabase.auth.sign_up({
        "email": payload.email,
        "password": payload.password
    })

    
    if auth_res.user is None:
        raise HTTPException(
            status_code=409,
            detail="User with this email already exists"
        )

    user_id = auth_res.user.id

    # Create user profile
    supabase.table("users").insert({
        "id": user_id,
        "email": payload.email,
        "username": payload.username,
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "is_verified": False
    }).execute()
    
    # Track login activity
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")
    session_id = auth_res.session.access_token if auth_res.session else ""
    
    track_login_activity(user_id, session_id, client_ip, user_agent)

    return {
        "success": True,
        "user": {
            "id": user_id,
            "email": payload.email,
            "username": payload.username,
            "first_name": payload.first_name,
            "last_name": payload.last_name
        },
        "session": auth_res.session
    }
    
# Login Api
@router.post("/login")
def login(payload: LoginRequest, request: Request):
    auth_res = supabase.auth.sign_in_with_password({
        "email": payload.email,
        "password": payload.password
    })
    
    if not auth_res.user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last active timestamp
    supabase.table("users").update({
        "last_active_at": "now()"
    }).eq("id", auth_res.user.id).execute()
    
    # Track login activity
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")
    session_id = auth_res.session.access_token if auth_res.session else ""
    
    track_login_activity(auth_res.user.id, session_id, client_ip, user_agent)
    
    return {
        "success": True,
        "user": {
            "id": auth_res.user.id,
            "email": auth_res.user.email
        },
        "session": auth_res.session
    }
    
#Logout Api
@router.post("/logout")
def logout(
    payload: LogoutRequest,
    user=Depends(require_auth),
    request: Request = None
):
    supabase.auth.sign_out(payload.refresh_token)
    
    # Deactivate session in login_activity
    session_token = request.headers.get("Authorization", "").replace("Bearer ", "") if request else ""
    if session_token:
        deactivate_session(session_token)

    return {"success": True}


# Refresh token it will be called by frontend
@router.post("/refresh")
def refresh(payload: RefreshRequest):
    auth_res = supabase.auth.refresh_session(payload.refresh_token)
    
    if not auth_res.session:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    return {
        "success": True,
        "session": auth_res.session
    }
    
    
#Forgot Password
@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    supabase.auth.reset_password_email(payload.email)
    
    return {
        "success": True,
        "message": "If email exists, password reset link has been sent"
    }
    

# Reset password 
@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    supabase.auth.update_user(
        payload.access_token,
        {"password": payload.new_password}
    )
    
    return {
        "success": True,
        "message": "Password updated successfully"
    }
    
    
@router.get("/me")
def me(user=Depends(require_auth)):
    return {
        "id": user.id,
        "email": user.email
    }