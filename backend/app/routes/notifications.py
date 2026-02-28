from fastapi import APIRouter, HTTPException, Depends, Query
from app.lib.supabase import supabase
from app.middleware.auth import require_auth
from app.models.notification import NotificationCreate, NotificationResponse
from typing import List

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    user_id: str = Depends(require_auth),
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's notifications"""
    try:
        query = supabase.table("notifications").select("*").eq("user_id", user_id)
        
        if unread_only:
            query = query.eq("is_read", False)
        
        notifications = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return notifications.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/unread-count")
def get_unread_count(user_id: str = Depends(require_auth)):
    """Get count of unread notifications"""
    try:
        count = supabase.table("notifications").select("id", count="exact").eq("user_id", user_id).eq("is_read", False).execute()
        
        return {"count": count.count if count.count else 0}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")

@router.put("/{notification_id}/read")
def mark_notification_as_read(notification_id: str, user_id: str = Depends(require_auth)):
    """Mark a notification as read"""
    try:
        # Verify ownership
        notification = supabase.table("notifications").select("user_id").eq("id", notification_id).single().execute()
        
        if not notification.data or notification.data["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).execute()
        
        return {"message": "Notification marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/read-all")
def mark_all_as_read(user_id: str = Depends(require_auth)):
    """Mark all notifications as read"""
    try:
        supabase.table("notifications").update({"is_read": True}).eq("user_id", user_id).eq("is_read", False).execute()
        
        return {"message": "All notifications marked as read"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{notification_id}")
def delete_notification(notification_id: str, user_id: str = Depends(require_auth)):
    """Delete a notification"""
    try:
        # Verify ownership
        notification = supabase.table("notifications").select("user_id").eq("id", notification_id).single().execute()
        
        if not notification.data or notification.data["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        supabase.table("notifications").delete().eq("id", notification_id).execute()
        
        return {"message": "Notification deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/clear-all")
def clear_all_notifications(user_id: str = Depends(require_auth)):
    """Clear all read notifications"""
    try:
        supabase.table("notifications").delete().eq("user_id", user_id).eq("is_read", True).execute()
        
        return {"message": "Read notifications cleared"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Helper function to create notifications (used by other routes)
def create_notification(user_id: str, notification_type: str, title: str, message: str, link: str = None):
    """Helper function to create a notification"""
    try:
        data = {
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "link": link,
            "is_read": False
        }
        
        supabase.table("notifications").insert(data).execute()
        # TODO: Emit real-time event for user
    except Exception as e:
        print(f"Error creating notification: {e}")
