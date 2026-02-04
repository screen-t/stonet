# TASK: BE-007 - Work Experience & Education APIs

**Assigned To:** Backend Developer  
**Priority:** MEDIUM  
**Estimate:** 10 hours  
**Deadline:** February 10, 2026  
**Status:** Not Started  
**Dependencies:** BE-006 (User Profile CRUD)  
**Created:** February 5, 2026

---

## Objective

Implement comprehensive CRUD APIs for managing user work experience and education records, with proper validation, ordering, and relationship management.

## Prerequisites

- BE-006 (User Profile CRUD) completed
- Database schema includes work_experience and education tables
- Understanding of date validation and current position logic
- Knowledge of database relationships and constraints

## Instructions

### Step 1: Work Experience Models (models/work_experience.py)

```python
from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class WorkExperienceBase(BaseModel):
    company_name: str
    position_title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    location: Optional[str] = None
    
    @validator('company_name')
    def validate_company_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Company name must be at least 2 characters')
        return v.strip()
    
    @validator('position_title')
    def validate_position_title(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Position title must be at least 2 characters')
        return v.strip()
    
    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and v < values['start_date']:
            raise ValueError('End date cannot be before start date')
        return v
    
    @validator('is_current')
    def validate_current(cls, v, values):
        if v and 'end_date' in values and values['end_date']:
            raise ValueError('Current position cannot have an end date')
        return v
    
    @validator('description')
    def validate_description(cls, v):
        if v and len(v) > 1000:
            raise ValueError('Description cannot exceed 1000 characters')
        return v

class WorkExperienceCreate(WorkExperienceBase):
    pass

class WorkExperienceUpdate(BaseModel):
    company_name: Optional[str] = None
    position_title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_current: Optional[bool] = None
    location: Optional[str] = None

class WorkExperienceResponse(WorkExperienceBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

### Step 2: Education Models (models/education.py)

```python
from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class EducationLevel(str, Enum):
    HIGH_SCHOOL = "high_school"
    ASSOCIATE = "associate"
    BACHELOR = "bachelor"
    MASTER = "master"
    DOCTORATE = "doctorate"
    CERTIFICATE = "certificate"
    OTHER = "other"

class EducationBase(BaseModel):
    institution_name: str
    degree: str
    field_of_study: Optional[str] = None
    level: EducationLevel
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    gpa: Optional[float] = None
    description: Optional[str] = None
    
    @validator('institution_name')
    def validate_institution_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Institution name must be at least 2 characters')
        return v.strip()
    
    @validator('degree')
    def validate_degree(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Degree must be at least 2 characters')
        return v.strip()
    
    @validator('gpa')
    def validate_gpa(cls, v):
        if v is not None:
            if v < 0.0 or v > 4.0:
                raise ValueError('GPA must be between 0.0 and 4.0')
        return v
    
    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and v < values['start_date']:
            raise ValueError('End date cannot be before start date')
        return v
    
    @validator('is_current')
    def validate_current(cls, v, values):
        if v and 'end_date' in values and values['end_date']:
            raise ValueError('Current education cannot have an end date')
        return v

class EducationCreate(EducationBase):
    pass

class EducationUpdate(BaseModel):
    institution_name: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    level: Optional[EducationLevel] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_current: Optional[bool] = None
    gpa: Optional[float] = None
    description: Optional[str] = None

class EducationResponse(EducationBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

### Step 3: Work Experience Helper Functions (lib/work_experience_helpers.py)

```python
from supabase import Client
from typing import List, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

async def get_user_work_experiences(supabase: Client, user_id: str) -> List[dict]:
    """Get all work experiences for a user, ordered by start date (most recent first)"""
    try:
        result = supabase.table('work_experience')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('start_date', desc=True)\
            .execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error fetching work experiences for user {user_id}: {str(e)}")
        raise Exception(f"Failed to fetch work experiences: {str(e)}")

async def create_work_experience(supabase: Client, user_id: str, work_data: dict) -> dict:
    """Create a new work experience entry"""
    try:
        # Add user_id and timestamps
        work_data['user_id'] = user_id
        work_data['created_at'] = datetime.utcnow().isoformat()
        work_data['updated_at'] = datetime.utcnow().isoformat()
        
        result = supabase.table('work_experience').insert(work_data).execute()
        
        if not result.data:
            raise Exception("Failed to create work experience")
        
        return result.data[0]
        
    except Exception as e:
        logger.error(f"Error creating work experience for user {user_id}: {str(e)}")
        raise Exception(f"Failed to create work experience: {str(e)}")

async def update_work_experience(supabase: Client, user_id: str, work_id: int, work_data: dict) -> dict:
    """Update a work experience entry"""
    try:
        # Add updated timestamp
        work_data['updated_at'] = datetime.utcnow().isoformat()
        
        result = supabase.table('work_experience')\
            .update(work_data)\
            .eq('id', work_id)\
            .eq('user_id', user_id)\
            .execute()
        
        if not result.data:
            raise Exception("Work experience not found or update failed")
        
        return result.data[0]
        
    except Exception as e:
        logger.error(f"Error updating work experience {work_id}: {str(e)}")
        raise Exception(f"Failed to update work experience: {str(e)}")

async def delete_work_experience(supabase: Client, user_id: str, work_id: int) -> bool:
    """Delete a work experience entry"""
    try:
        result = supabase.table('work_experience')\
            .delete()\
            .eq('id', work_id)\
            .eq('user_id', user_id)\
            .execute()
        
        return len(result.data) > 0
        
    except Exception as e:
        logger.error(f"Error deleting work experience {work_id}: {str(e)}")
        return False

async def get_work_experience_by_id(supabase: Client, user_id: str, work_id: int) -> Optional[dict]:
    """Get a specific work experience by ID"""
    try:
        result = supabase.table('work_experience')\
            .select('*')\
            .eq('id', work_id)\
            .eq('user_id', user_id)\
            .execute()
        
        return result.data[0] if result.data else None
        
    except Exception as e:
        logger.error(f"Error fetching work experience {work_id}: {str(e)}")
        return None
```

### Step 4: Education Helper Functions (lib/education_helpers.py)

```python
# Similar structure to work_experience_helpers.py
from supabase import Client
from typing import List, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

async def get_user_education(supabase: Client, user_id: str) -> List[dict]:
    """Get all education records for a user, ordered by start date (most recent first)"""
    try:
        result = supabase.table('education')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('start_date', desc=True)\
            .execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error fetching education for user {user_id}: {str(e)}")
        raise Exception(f"Failed to fetch education: {str(e)}")

async def create_education(supabase: Client, user_id: str, education_data: dict) -> dict:
    """Create a new education entry"""
    try:
        education_data['user_id'] = user_id
        education_data['created_at'] = datetime.utcnow().isoformat()
        education_data['updated_at'] = datetime.utcnow().isoformat()
        
        result = supabase.table('education').insert(education_data).execute()
        
        if not result.data:
            raise Exception("Failed to create education entry")
        
        return result.data[0]
        
    except Exception as e:
        logger.error(f"Error creating education for user {user_id}: {str(e)}")
        raise Exception(f"Failed to create education: {str(e)}")

# Similar update, delete, and get_by_id functions...
```

### Step 5: API Endpoints (routes/work_experience.py)

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from app.lib.supabase import get_supabase_client
from app.lib.auth_helpers import get_current_user
from app.lib.work_experience_helpers import (
    get_user_work_experiences, create_work_experience, 
    update_work_experience, delete_work_experience, get_work_experience_by_id
)
from app.models.work_experience import (
    WorkExperienceCreate, WorkExperienceUpdate, WorkExperienceResponse
)
from typing import List

router = APIRouter(prefix="/work-experience", tags=["work-experience"])

@router.get("/", response_model=List[WorkExperienceResponse])
async def get_work_experiences(
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Get all work experiences for the current user"""
    try:
        experiences = await get_user_work_experiences(supabase, current_user['id'])
        return [WorkExperienceResponse(**exp) for exp in experiences]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=WorkExperienceResponse)
async def create_work_experience_endpoint(
    work_experience: WorkExperienceCreate,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Create a new work experience"""
    try:
        work_data = work_experience.dict()
        result = await create_work_experience(supabase, current_user['id'], work_data)
        return WorkExperienceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{work_id}", response_model=WorkExperienceResponse)
async def get_work_experience(
    work_id: int,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Get a specific work experience"""
    try:
        experience = await get_work_experience_by_id(supabase, current_user['id'], work_id)
        if not experience:
            raise HTTPException(status_code=404, detail="Work experience not found")
        return WorkExperienceResponse(**experience)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{work_id}", response_model=WorkExperienceResponse)
async def update_work_experience_endpoint(
    work_id: int,
    work_update: WorkExperienceUpdate,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Update a work experience"""
    try:
        work_data = work_update.dict(exclude_unset=True)
        result = await update_work_experience(supabase, current_user['id'], work_id, work_data)
        return WorkExperienceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{work_id}")
async def delete_work_experience_endpoint(
    work_id: int,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Delete a work experience"""
    try:
        success = await delete_work_experience(supabase, current_user['id'], work_id)
        if not success:
            raise HTTPException(status_code=404, detail="Work experience not found")
        return {"message": "Work experience deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Step 6: Education API Endpoints (routes/education.py)

```python
# Similar structure to work_experience.py with education-specific logic
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.lib.supabase import get_supabase_client
from app.lib.auth_helpers import get_current_user
from app.lib.education_helpers import (
    get_user_education, create_education, 
    update_education, delete_education, get_education_by_id
)
from app.models.education import (
    EducationCreate, EducationUpdate, EducationResponse
)
from typing import List

router = APIRouter(prefix="/education", tags=["education"])

@router.get("/", response_model=List[EducationResponse])
async def get_education_records(
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Get all education records for the current user"""
    try:
        education = await get_user_education(supabase, current_user['id'])
        return [EducationResponse(**edu) for edu in education]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Similar CRUD endpoints...
```

### Step 7: Update main.py

```python
# Add to main.py
from app.routes import work_experience, education

# Include the routers
app.include_router(work_experience.router)
app.include_router(education.router)
```

## Deliverables

- [ ] Work experience models with validation
- [ ] Education models with validation
- [ ] Work experience helper functions
- [ ] Education helper functions
- [ ] Work experience CRUD endpoints
- [ ] Education CRUD endpoints
- [ ] Date validation and current position logic
- [ ] Proper error handling and logging
- [ ] API documentation
- [ ] Test cases for all endpoints

## Acceptance Criteria

1. **Work Experience Management:**
   - Users can create, read, update, and delete work experiences
   - Date validation works correctly
   - Current position logic prevents end dates
   - Proper ordering by start date (most recent first)

2. **Education Management:**
   - Users can manage education records
   - GPA validation (0.0-4.0) works
   - Education levels properly categorized
   - Current education logic implemented

3. **Data Validation:**
   - Company/institution names required (min 2 chars)
   - Position/degree titles required (min 2 chars)
   - End dates cannot be before start dates
   - Current positions/education cannot have end dates
   - Description length limits enforced

4. **API Quality:**
   - Consistent error handling
   - Proper HTTP status codes
   - Comprehensive logging
   - User can only access their own data

## API Documentation

### Work Experience Endpoints:
- `GET /work-experience` - Get user's work experiences
- `POST /work-experience` - Create work experience
- `GET /work-experience/{id}` - Get specific work experience
- `PATCH /work-experience/{id}` - Update work experience
- `DELETE /work-experience/{id}` - Delete work experience

### Education Endpoints:
- `GET /education` - Get user's education records
- `POST /education` - Create education record
- `GET /education/{id}` - Get specific education record
- `PATCH /education/{id}` - Update education record
- `DELETE /education/{id}` - Delete education record

## Testing Commands

```bash
# Test work experience endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8002/work-experience

# Create work experience
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Tech Corp",
    "position_title": "Software Engineer",
    "start_date": "2023-01-01T00:00:00Z",
    "is_current": true,
    "location": "San Francisco, CA"
  }' \
  http://localhost:8002/work-experience

# Test education endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8002/education
```

## Questions or Issues?

Contact:
- **Project Manager:** Daniel
- **Backend Lead:** [TBD]
- **Technical Lead:** [TBD]

## Next Steps After Completion

1. Test all CRUD operations thoroughly
2. Share API documentation with frontend team
3. Begin FE-005 (Work History & Education Forms)
4. Implement data export functionality
5. Add work experience/education search and filtering

---

**Status Updates:**
- [ ] Started: _________
- [ ] Models Created: _________
- [ ] Helper Functions Complete: _________
- [ ] Work Experience Endpoints: _________
- [ ] Education Endpoints: _________
- [ ] Testing Complete: _________
- [ ] Completed: _________
- [ ] Frontend Team Notified: _________