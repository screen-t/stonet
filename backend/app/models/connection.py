from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ConnectionStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    BLOCKED = "blocked"

class ConnectionRequest(BaseModel):
    receiver_id: str

class ConnectionUpdate(BaseModel):
    status: ConnectionStatus

class ConnectionResponse(BaseModel):
    id: str
    requester_id: str
    receiver_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    # Populated separately
    requester: Optional[dict] = None
    receiver: Optional[dict] = None
