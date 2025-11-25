from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import security
from app.models import User
from app.schemas import user as schemas
from app.api.deps import get_current_active_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/me", response_model=schemas.UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get current user profile.
    """
    return current_user


@router.put("/me", response_model=schemas.UserProfile)
async def update_current_user(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update current user profile.
    """
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Check if email is being changed and if it's already taken
    if "email" in update_data and update_data["email"] != current_user.email:
        existing_user = db.query(User).filter(User.email == update_data["email"]).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Update fields
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    logger.info(f"User profile updated: {current_user.username}")
    return current_user


@router.post("/me/change-password")
async def change_password(
    password_data: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Change current user password.
    """
    # Verify current password
    if not security.verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password
    current_user.hashed_password = security.get_password_hash(password_data.new_password)
    db.commit()
    
    logger.info(f"Password changed for user: {current_user.username}")
    
    return {"message": "Password changed successfully"}
