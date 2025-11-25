from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# Activity Log schemas
class ActivityLogBase(BaseModel):
    """Base activity log schema."""
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    description: Optional[str] = None


class ActivityLog(ActivityLogBase):
    """Schema for activity log response."""
    id: int
    changes: Optional[dict] = None
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    user_id: Optional[int]
    
    class Config:
        from_attributes = True


class ActivityLogList(BaseModel):
    """Schema for paginated activity log list."""
    items: List[ActivityLog]
    total: int
    page: int
    page_size: int
    total_pages: int


# Security Event schemas
class SecurityEventBase(BaseModel):
    """Base security event schema."""
    event_type: str
    severity: str
    description: Optional[str] = None


class SecurityEvent(SecurityEventBase):
    """Schema for security event response."""
    id: int
    ip_address: Optional[str]
    user_agent: Optional[str]
    metadata: Optional[dict] = None
    created_at: datetime
    user_id: Optional[int]
    
    class Config:
        from_attributes = True


class SecurityEventList(BaseModel):
    """Schema for paginated security event list."""
    items: List[SecurityEvent]
    total: int
    page: int
    page_size: int
    total_pages: int


# Attachment schema
class Attachment(BaseModel):
    """Schema for attachment response."""
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    created_at: datetime
    task_id: int
    
    class Config:
        from_attributes = True


# Common response schema
class ResponseModel(BaseModel):
    """Standard API response model."""
    success: bool = True
    message: str
    data: Optional[Any] = None


# Statistics schemas
class UserStats(BaseModel):
    """User statistics schema."""
    total_users: int
    active_users: int
    inactive_users: int
    admin_users: int
    regular_users: int


class TaskStats(BaseModel):
    """Task statistics schema."""
    total_tasks: int
    todo_tasks: int
    in_progress_tasks: int
    review_tasks: int
    completed_tasks: int
    overdue_tasks: int
    by_priority: dict
    by_category: dict


class DashboardStats(BaseModel):
    """Dashboard statistics schema."""
    user_stats: UserStats
    task_stats: TaskStats
    recent_activities: List[ActivityLog]
    security_alerts: int
