from fastapi import APIRouter, HTTPException
from app.lib.supabase import supabase

router = APIRouter(prefix="/auth", tags=["Auth"])

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