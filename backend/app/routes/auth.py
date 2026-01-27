from fastapi import APIRouter, HTTPException,  Depends
from app.lib.supabase import supabase
from app.middleware.auth import require_auth

router = APIRouter(prefix="/auth", tags=["Auth"])

# Signup Api
@router.post("/signup")
def signup(payload: dict):
    email = payload.get("email")
    password = payload.get("password")
    username = payload.get("username")
    first_name = payload.get("first_name")
    last_name = payload.get("last_name")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email & password required")

    auth_res = supabase.auth.sign_up({
        "email": email,
        "password": password
    })

    
    if auth_res.user is None:
        raise HTTPException(
            status_code=409,
            detail="User with tis email already exist"
        )

    user_id = auth_res.user.id

    supabase.table("users").insert({
        "id": user_id,
        "email": email,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "is_verified": False
    }).execute()

    return {
        "success": True,
        "user": {
            "id": user_id,
            "email": email,
            "username": username,
            "first_name": first_name,
            "last_name": last_name
        },
        "session": auth_res.session
    }
    
# Login Api
@router.post("/login")
def login(payload: dict):
    email = payload.get("email")
    password = payload.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email & password required")
    
    auth_res = supabase.auth.sign_in_with_password({
        "email":email,
        "password":password
    })
    
    if not auth_res.user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    supabase.table("users").update({
        "last_active_at": "now()"
    }).eq("id", auth_res.user.id).execute()
    
    return{
        "success":True,
        "user":{
            "id":auth_res.user.id,
            "email": auth_res.user.email
        },
        "session": auth_res.session
    }
    
#Logout Api
@router.post("/logout")
def logout(
    payload: dict,
    user=Depends(require_auth)
):
    refresh_token = payload.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token required")

    supabase.auth.sign_out(refresh_token)

    return {"success": True}


# Refresh token it will be called by frontend
@router.post("/refresh")
def refresh(payload: dict):
    refresh_token = payload.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token required")
    
    auth_res = supabase.auth.refresh_session(refresh_token)
    
    if not auth_res.session:
        raise HTTPException(status_code=401, detail= "Invalid refresh token")
    
    return {
        "success": True,
        "session":auth_res.session
    }
    
    
#Forgot Password

@router.post("/forgot-password")
def forgot_password(payload: dict):
    email = payload.get("email")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    
    supabase.auth.reset_password_email(email)
    
    return{
        "success":True,
        "message": "Password reset email send"
    }
    

# Reset password 
@router.post("/reset-password")
def reset_password(payload: dict):
    access_token = payload.get("access_token")
    new_password = payload.get("new_password")
    
    if not access_token or not new_password:
        raise HTTPException(status_code=400, detail="Invalid request")
    
    supabase.auth.update_user(
        access_token,
        {"password": new_password}
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