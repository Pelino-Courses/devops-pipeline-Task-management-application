from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List
import math

from app.core.database import get_db
from app.models import User, Task, ActivityLog, SecurityEvent, TaskStatus, TaskPriority
from app.schemas import user as user_schemas
from app.schemas.common import (
    DashboardStats, UserStats, TaskStats,
    ActivityLogList, SecurityEventList,
    ResponseModel
)
from app.api.deps import get_current_admin_user, get_current_auditor_or_admin
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Get dashboard statistics (admin only).
    """
    # User statistics
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    inactive_users = total_users - active_users
    admin_users = db.query(func.count(User.id)).filter(User.role == "admin").scalar()
    regular_users = db.query(func.count(User.id)).filter(User.role == "user").scalar()
    
    user_stats = UserStats(
        total_users=total_users,
        active_users=active_users,
        inactive_users=inactive_users,
        admin_users=admin_users,
        regular_users=regular_users
    )
    
    # Task statistics
    total_tasks = db.query(func.count(Task.id)).scalar()
    todo_tasks = db.query(func.count(Task.id)).filter(Task.status == TaskStatus.TODO).scalar()
    in_progress_tasks = db.query(func.count(Task.id)).filter(Task.status == TaskStatus.IN_PROGRESS).scalar()
    review_tasks = db.query(func.count(Task.id)).filter(Task.status == TaskStatus.REVIEW).scalar()
    completed_tasks = db.query(func.count(Task.id)).filter(Task.status == TaskStatus.COMPLETED).scalar()
    overdue_tasks = db.query(func.count(Task.id)).filter(
        Task.due_date < datetime.utcnow(),
        Task.status != TaskStatus.COMPLETED
    ).scalar()
    
    # Tasks by priority
    by_priority = {}
    for priority in TaskPriority:
        count = db.query(func.count(Task.id)).filter(Task.priority == priority).scalar()
        by_priority[priority.value] = count
    
    # Tasks by category
    category_counts = db.query(
        Task.category, func.count(Task.id)
    ).filter(Task.category.isnot(None)).group_by(Task.category).all()
    by_category = {cat: count for cat, count in category_counts}
    
    task_stats = TaskStats(
        total_tasks=total_tasks,
        todo_tasks=todo_tasks,
        in_progress_tasks=in_progress_tasks,
        review_tasks=review_tasks,
        completed_tasks=completed_tasks,
        overdue_tasks=overdue_tasks,
        by_priority=by_priority,
        by_category=by_category
    )
    
    # Recent activities
    recent_activities = db.query(ActivityLog).order_by(desc(ActivityLog.created_at)).limit(10).all()
    
    # Security alerts (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(days=1)
    security_alerts = db.query(func.count(SecurityEvent.id)).filter(
        SecurityEvent.severity.in_(["WARNING", "CRITICAL"]),
        SecurityEvent.created_at >= yesterday
    ).scalar()
    
    return DashboardStats(
        user_stats=user_stats,
        task_stats=task_stats,
        recent_activities=recent_activities,
        security_alerts=security_alerts
    )


@router.get("/users", response_model=List[user_schemas.User])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """
    Get all users (admin only).
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.patch("/users/{user_id}/role", response_model=user_schemas.User)
async def update_user_role(
    user_id: int,
    role_update: user_schemas.UserUpdateRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Update user role (admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    
    logger.info(f"User role updated: {user.username} -> {role_update.role}")
    return user


@router.patch("/users/{user_id}/status", response_model=user_schemas.User)
async def update_user_status(
    user_id: int,
    status_update: user_schemas.UserUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Activate or deactivate user (admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deactivating themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user.is_active = status_update.is_active
    db.commit()
    db.refresh(user)
    
    logger.info(f"User status updated: {user.username} -> active={status_update.is_active}")
    return user


@router.get("/audit-logs", response_model=ActivityLogList)
async def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_auditor_or_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """
    Get audit logs (admin and auditor only).
    """
    query = db.query(ActivityLog)
    total = query.count()
    
    offset = (page - 1) * page_size
    logs = query.order_by(desc(ActivityLog.created_at)).offset(offset).limit(page_size).all()
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return ActivityLogList(
        items=logs,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/security-events", response_model=SecurityEventList)
async def get_security_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_auditor_or_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    severity: str = Query(None),
):
    """
    Get security events (admin and auditor only).
    """
    query = db.query(SecurityEvent)
    
    if severity:
        query = query.filter(SecurityEvent.severity == severity.upper())
    
    total = query.count()
    
    offset = (page - 1) * page_size
    events = query.order_by(desc(SecurityEvent.created_at)).offset(offset).limit(page_size).all()
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return SecurityEventList(
        items=events,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
