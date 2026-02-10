from fastapi import Request, HTTPException
from app.lib.supabase import supabase
import httpx

def require_auth(request: Request):
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="UnAuthorized")
    
    token = auth_header.replace("Bearer ","")
    
    try:
        user_res = supabase.auth.get_user(token)
        
        if not user_res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return user_res.user.id
    except httpx.ReadError as e:
        print(f"Supabase connection error: {e}")
        raise HTTPException(status_code=503, detail="Authentication service temporarily unavailable")
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

