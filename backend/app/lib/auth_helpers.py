from app.lib.supabase import supabase
from datetime import datetime

def check_username_availability(username: str) -> bool:
    """Check if username is available"""
    result = supabase.table("users").select("id").eq("username", username.lower()).execute()
    return len(result.data) == 0

def track_login_activity(user_id: str, session_id: str, ip_address: str, user_agent: str, status: str = "success"):
    """Track user login activity"""
    # Parse user agent for browser and device info
    browser = "Unknown"
    device = "Unknown"
    
    if user_agent:
        if "Chrome" in user_agent:
            browser = "Chrome"
        elif "Firefox" in user_agent:
            browser = "Firefox"
        elif "Safari" in user_agent:
            browser = "Safari"
        elif "Edge" in user_agent:
            browser = "Edge"
        
        if "Mobile" in user_agent or "Android" in user_agent or "iPhone" in user_agent:
            device = "Mobile"
        elif "Tablet" in user_agent or "iPad" in user_agent:
            device = "Tablet"
        else:
            device = "Desktop"
    
    supabase.table("login_activity").insert({
        "user_id": user_id,
        "device": device,
        "browser": browser,
        "ip_address": ip_address,
        "status": status,
        "session_id": session_id,
        "is_active": True,
        "login_at": datetime.utcnow().isoformat()
    }).execute()

def deactivate_session(session_id: str):
    """Mark a session as inactive"""
    supabase.table("login_activity").update({
        "is_active": False,
        "logout_at": datetime.utcnow().isoformat()
    }).eq("session_id", session_id).execute()
