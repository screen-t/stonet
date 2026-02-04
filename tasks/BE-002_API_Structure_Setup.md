# TASK: BE-002 - API Structure Setup

**Assigned To:** Backend Developer  
**Priority:** HIGH  
**Estimate:** 8 hours  
**Deadline:** February 7, 2026  
**Status:** Not Started  
**Dependencies:** BE-001 (Supabase Project Setup)  
**Created:** February 5, 2026

---

## Objective

Set up the foundational API structure and base configurations for the Stonet backend, including middleware, error handling, and logging frameworks.

## Prerequisites

- BE-001 (Supabase Project Setup) completed
- FastAPI knowledge
- Access to backend repository

## Instructions

### Step 1: API Folder Structure

Create the following folder structure in the backend:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py              # Configuration management
│   ├── core/
│   │   ├── __init__.py
│   │   ├── middleware.py       # Custom middleware
│   │   ├── exceptions.py       # Custom exceptions
│   │   └── security.py         # Security utilities
│   ├── lib/
│   │   ├── __init__.py
│   │   ├── logger.py          # Logging configuration
│   │   └── response.py        # Standard response formats
│   ├── models/
│   │   ├── __init__.py
│   │   └── base.py            # Base Pydantic models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py          # Health check endpoints
│   │   └── __init__.py
│   └── middleware/
│       ├── __init__.py
│       ├── cors.py            # CORS configuration
│       └── logging.py         # Request logging
```

### Step 2: Base Configuration (config.py)

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App
    app_name: str = "Stonet API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    
    # Security
    secret_key: str
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

### Step 3: Error Handling Framework (core/exceptions.py)

```python
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
import logging

logger = logging.getLogger(__name__)

class APIException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str = None):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code

class ValidationException(APIException):
    def __init__(self, detail: str, field: str = None):
        super().__init__(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            error_code="VALIDATION_ERROR"
        )
        self.field = field

async def api_exception_handler(request: Request, exc: APIException):
    logger.error(f"API Exception: {exc.detail} - Path: {request.url.path}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.detail,
                "code": getattr(exc, 'error_code', 'API_ERROR'),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )
```

### Step 4: Logging Configuration (lib/logger.py)

```python
import logging
from datetime import datetime
from app.config import settings

def setup_logging():
    """Configure application logging"""
    log_level = logging.DEBUG if settings.debug else logging.INFO
    
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
```

### Step 5: Health Check Endpoint (routes/health.py)

```python
from fastapi import APIRouter, Depends
from app.lib.supabase import get_supabase_client
from datetime import datetime

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@router.get("/db")
async def database_health(supabase = Depends(get_supabase_client)):
    """Database connection health check"""
    try:
        # Simple query to test database connection
        result = supabase.table('users').select('count', count='exact').execute()
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
```

### Step 6: Update main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.lib.logger import setup_logging
from app.core.exceptions import api_exception_handler, APIException
from app.routes import health

# Setup logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(APIException, api_exception_handler)

# Include routers
app.include_router(health.router)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.app_name}", "version": settings.app_version}
```

### Step 7: Update requirements.txt

Add these dependencies:

```
fastapi
uvicorn[standard]
pydantic-settings
python-multipart
supabase
python-jose[cryptography]
passlib[bcrypt]
```

## Deliverables

- [ ] API folder structure created
- [ ] Base middleware configured
- [ ] Error handling framework implemented
- [ ] Logging system configured
- [ ] Health check endpoints working
- [ ] CORS properly configured
- [ ] Configuration management setup

## Acceptance Criteria

1. **API Structure:**
   - All folders and base files created
   - Proper Python imports work
   - No import errors

2. **Health Check:**
   - GET /health returns 200 OK
   - GET /health/db tests database connection
   - Proper JSON response format

3. **Error Handling:**
   - Custom exceptions work properly
   - Error responses have consistent format
   - Logging captures errors correctly

4. **CORS Configuration:**
   - Frontend can make requests to API
   - Proper headers included
   - Credentials allowed

5. **Environment:**
   - Configuration loads from .env file
   - Required environment variables documented
   - Settings accessible throughout app

## Environment Variables Required

```bash
# .env file
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SECRET_KEY=your_secret_key_here
DEBUG=True
```

## Testing Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8002

# Test health endpoints
curl http://localhost:8002/health
curl http://localhost:8002/health/db
```

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Backend Lead:** [TBD]
- **Technical Lead:** [TBD]

## Next Steps After Completion

1. Verify all health checks pass
2. Share API structure with team
3. Begin BE-003 (Authentication endpoints)
4. Document API base URL for frontend team

---

**Status Updates:**
- [ ] Started: _________
- [ ] Folder Structure Complete: _________
- [ ] Configuration Setup: _________
- [ ] Error Handling Complete: _________
- [ ] Health Checks Working: _________
- [ ] Completed: _________
- [ ] Team Notified: _________