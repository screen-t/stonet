from fastapi import APIRouter, HTTPException, Depends, Query
from app.lib.supabase import supabase
from app.middleware.auth import require_auth
from typing import List, Optional

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/users")
def search_users(
    q: str = Query(..., min_length=1, max_length=100),
    user_id: Optional[str] = Depends(require_auth),
    limit: int = Query(20, ge=1, le=50)
):
    """Search for users by name, username, or headline"""
    try:
        # Search in multiple fields
        search_term = f"%{q}%"
        
        # Use ilike for case-insensitive search
        results = supabase.table("users").select(
            "id, username, first_name, last_name, avatar_url, headline, current_position, current_company, industry"
        ).or_(
            f"username.ilike.{search_term},first_name.ilike.{search_term},last_name.ilike.{search_term},headline.ilike.{search_term}"
        ).eq("is_active", True).limit(limit).execute()
        
        return {"results": results.data, "count": len(results.data)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/posts")
def search_posts(
    q: str = Query(..., min_length=1, max_length=100),
    user_id: Optional[str] = Depends(require_auth),
    limit: int = Query(20, ge=1, le=50)
):
    """Search for posts by content"""
    try:
        search_term = f"%{q}%"
        
        results = supabase.table("posts").select("*").ilike("content", search_term).eq("is_published", True).eq("is_draft", False).eq("visibility", "public").order("created_at", desc=True).limit(limit).execute()
        
        # Enrich with author info
        for post in results.data:
            author = supabase.table("users").select("id, username, first_name, last_name, avatar_url").eq("id", post["author_id"]).single().execute()
            post["author"] = author.data if author.data else None
        
        return {"results": results.data, "count": len(results.data)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all")
def search_all(
    q: str = Query(..., min_length=1, max_length=100),
    user_id: Optional[str] = Depends(require_auth),
    users_limit: int = Query(10, ge=1, le=50),
    posts_limit: int = Query(10, ge=1, le=50)
):
    """Search across users and posts"""
    try:
        search_term = f"%{q}%"
        
        # Search users
        users = supabase.table("users").select(
            "id, username, first_name, last_name, avatar_url, headline, current_position, current_company"
        ).or_(
            f"username.ilike.{search_term},first_name.ilike.{search_term},last_name.ilike.{search_term},headline.ilike.{search_term}"
        ).eq("is_active", True).limit(users_limit).execute()
        
        # Search posts
        posts = supabase.table("posts").select("*").ilike("content", search_term).eq("is_published", True).eq("is_draft", False).eq("visibility", "public").order("created_at", desc=True).limit(posts_limit).execute()
        
        # Enrich posts with author info
        for post in posts.data:
            author = supabase.table("users").select("id, username, first_name, last_name, avatar_url").eq("id", post["author_id"]).single().execute()
            post["author"] = author.data if author.data else None
        
        return {
            "users": {"results": users.data, "count": len(users.data)},
            "posts": {"results": posts.data, "count": len(posts.data)}
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/suggestions")
def get_search_suggestions(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(5, ge=1, le=10)
):
    """Get search suggestions (autocomplete)"""
    try:
        search_term = f"{q}%"  # Prefix search for autocomplete
        
        # Get username and name suggestions
        users = supabase.table("users").select("username, first_name, last_name").or_(
            f"username.ilike.{search_term},first_name.ilike.{search_term},last_name.ilike.{search_term}"
        ).eq("is_active", True).limit(limit).execute()
        
        suggestions = []
        for user in users.data:
            full_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
            if full_name:
                suggestions.append({"type": "user", "text": full_name, "username": user.get("username")})
            elif user.get("username"):
                suggestions.append({"type": "user", "text": user["username"], "username": user["username"]})
        
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/trending")
def get_trending(limit: int = Query(10, ge=1, le=20)):
    """Get trending topics/posts (simplified version)"""
    try:
        # Get posts with most engagement in last 7 days
        # Simple version: most likes + comments + reposts
        posts = supabase.rpc("get_trending_posts", {"days_ago": 7, "result_limit": limit}).execute()
        
        # If RPC doesn't exist, fallback to simple query
        if not posts.data:
            posts = supabase.table("posts").select("*").eq("is_published", True).eq("is_draft", False).eq("visibility", "public").order("like_count", desc=True).order("comment_count", desc=True).limit(limit).execute()
        
        # Enrich with author info
        for post in posts.data:
            author = supabase.table("users").select("id, username, first_name, last_name, avatar_url").eq("id", post["author_id"]).single().execute()
            post["author"] = author.data if author.data else None
        
        return {"trending": posts.data}
    except Exception as e:
        # Fallback if RPC doesn't exist
        try:
            posts = supabase.table("posts").select("*").eq("is_published", True).eq("is_draft", False).eq("visibility", "public").order("like_count", desc=True).limit(limit).execute()
            
            for post in posts.data:
                author = supabase.table("users").select("id, username, first_name, last_name, avatar_url").eq("id", post["author_id"]).single().execute()
                post["author"] = author.data if author.data else None
            
            return {"trending": posts.data}
        except:
            raise HTTPException(status_code=400, detail="Error fetching trending posts")
