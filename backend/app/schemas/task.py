from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from app.models.task import TaskPriority, TaskStatus


# Simple user schema for task owner/shared users
class UserSimple(BaseModel):
    """Simplified user schema for task responses."""
    id: int
    username: str
    full_name: Optional[str]
    
    class Config:
        from_attributes = True


# Base schemas
class TaskBase(BaseModel):
    """Base task schema."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[str] = None
    due_date: Optional[datetime] = None
    reminder_date: Optional[datetime] = None


# Request schemas
class TaskCreate(TaskBase):
    """Schema for task creation."""
    status: Optional[TaskStatus] = TaskStatus.TODO


class TaskUpdate(BaseModel):
    """Schema for task update."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[str] = None
    due_date: Optional[datetime] = None
    reminder_date: Optional[datetime] = None


class TaskStatusUpdate(BaseModel):
    """Schema for task status update."""
    status: TaskStatus


class TaskShare(BaseModel):
    """Schema for sharing a task."""
    email: str


# Response schemas
class Task(TaskBase):
    """Schema for task response."""
    id: int
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]
    owner_id: int
    shared_with: List[UserSimple] = []
    
    class Config:
        from_attributes = True


class TaskWithOwner(Task):
    """Schema for task with owner information."""
    owner: UserSimple


class TaskList(BaseModel):
    """Schema for paginated task list."""
    items: List[Task]
    total: int
    page: int
    page_size: int
    total_pages: int


# Update forward references
TaskWithOwner.model_rebuild()
