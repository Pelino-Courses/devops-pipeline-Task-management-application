from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import Optional, List
from datetime import datetime
import math

from app.core.database import get_db
from app.models import Task, User, ActivityLog, TaskStatus
from app.schemas import task as schemas
from app.api.deps import get_current_active_user, check_user_permissions
from app.core.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def log_activity(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: int,
    user_id: int,
    description: str = None,
    changes: dict = None
):
    """Helper function to log activities."""
    activity = ActivityLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        user_id=user_id,
        description=description,
        changes=changes
    )
    db.add(activity)
    db.commit()


@router.get("", response_model=schemas.TaskList)
async def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    """
    Get paginated list of tasks for the current user.
    Admins can see all tasks.
    """
    query = db.query(Task)
    
    # Filter by owner unless admin
    if current_user.role != "admin":
        query = query.filter(Task.owner_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if category:
        query = query.filter(Task.category == category)
    if search:
        query = query.filter(
            or_(
                Task.title.ilike(f"%{search}%"),
                Task.description.ilike(f"%{search}%"),
                Task.tags.ilike(f"%{search}%")
            )
        )
    
    # Count total
    total = query.count()
    
    # Pagination
    offset = (page - 1) * page_size
    tasks = query.order_by(desc(Task.created_at)).offset(offset).limit(page_size).all()
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return {
        "items": tasks,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.post("", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new task.
    """
    new_task = Task(
        **task_in.model_dump(),
        owner_id=current_user.id
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    # Log activity
    log_activity(
        db=db,
        action="CREATE",
        entity_type="Task",
        entity_id=new_task.id,
        user_id=current_user.id,
        description=f"Created task: {new_task.title}"
    )
    
    logger.info(f"Task created: {new_task.id} by user {current_user.username}")
    return new_task


@router.get("/{task_id}", response_model=schemas.Task)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific task by ID.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not check_user_permissions(current_user, task.owner_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return task


@router.put("/{task_id}", response_model=schemas.Task)
async def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update a task.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not check_user_permissions(current_user, task.owner_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Store old values for logging
    old_values = {
        "title": task.title,
        "status": task.status.value,
        "priority": task.priority.value
    }
    
    # Update fields
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    # Update completed_at timestamp
    if task_update.status == TaskStatus.COMPLETED and not task.completed_at:
        task.completed_at = datetime.utcnow()
    elif task_update.status and task_update.status != TaskStatus.COMPLETED:
        task.completed_at = None
    
    db.commit()
    db.refresh(task)
    
    # Log activity
    new_values = {
        "title": task.title,
        "status": task.status.value,
        "priority": task.priority.value
    }
    
    log_activity(
        db=db,
        action="UPDATE",
        entity_type="Task",
        entity_id=task.id,
        user_id=current_user.id,
        description=f"Updated task: {task.title}",
        changes={"before": old_values, "after": new_values}
    )
    
    logger.info(f"Task updated: {task.id} by user {current_user.username}")
    return task


@router.patch("/{task_id}/status", response_model=schemas.Task)
async def update_task_status(
    task_id: int,
    status_update: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update only the task status.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not check_user_permissions(current_user, task.owner_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    old_status = task.status
    task.status = status_update.status
    
    # Update completed_at timestamp
    if status_update.status == TaskStatus.COMPLETED:
        task.completed_at = datetime.utcnow()
    else:
        task.completed_at = None
    
    db.commit()
    db.refresh(task)
    
    # Log activity
    log_activity(
        db=db,
        action="UPDATE_STATUS",
        entity_type="Task",
        entity_id=task.id,
        user_id=current_user.id,
        description=f"Changed task status from {old_status.value} to {task.status.value}",
        changes={"before": {"status": old_status.value}, "after": {"status": task.status.value}}
    )
    
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete a task.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    if not check_user_permissions(current_user, task.owner_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    task_title = task.title
    
    db.delete(task)
    db.commit()
    
    # Log activity
    log_activity(
        db=db,
        action="DELETE",
        entity_type="Task",
        entity_id=task_id,
        user_id=current_user.id,
        description=f"Deleted task: {task_title}"
    )
    
    logger.info(f"Task deleted: {task_id} by user {current_user.username}")
    return None
