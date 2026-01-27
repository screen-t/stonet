from fastapi import Request, HTTPException
from app.lib.supabase import supabase

def require_auth(request: Request):
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="UnAuthorized")
    
    token = auth_header.replace("Bearer ","")
    
    user_res = supabase.auth.get_user(token)
    
    if not user_res.user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return user_res.user

