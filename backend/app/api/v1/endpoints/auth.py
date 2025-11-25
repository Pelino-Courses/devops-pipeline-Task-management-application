from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import security
from app.models import User, SecurityEvent
from app.schemas import user as schemas
from app.schemas.common import ResponseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def log_security_event(
    db: Session,
    event_type: str,
    severity: str,
    description: str,
    user_id: int = None,
    ip_address: str = None,
    user_agent: str = None
):
    """Helper function to log security events."""
    security_event = SecurityEvent(
        event_type=event_type,
        severity=severity,
        description=description,
        user_id=user_id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(security_event)
    db.commit()


@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: schemas.UserCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_in.email) | (User.username == user_in.username)
    ).first()
    
    if existing_user:
        if existing_user.email == user_in.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = security.get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log security event
    log_security_event(
        db=db,
        event_type="USER_REGISTERED",
        severity="INFO",
        description=f"New user registered: {user_in.username}",
        user_id=new_user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    logger.info(f"New user registered: {user_in.username}")
    return new_user


@router.post("/login", response_model=schemas.Token)
async def login(
    user_credentials: schemas.UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Login user and return access token.
    """
    # Find user
    user = db.query(User).filter(User.username == user_credentials.username).first()
    
    if not user or not security.verify_password(user_credentials.password, user.hashed_password):
        # Log failed login
        log_security_event(
            db=db,
            event_type="LOGIN_FAILED",
            severity="WARNING",
            description=f"Failed login attempt for username: {user_credentials.username}",
            user_id=user.id if user else None,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    
    # Create tokens
    access_token = security.create_access_token(data={"sub": user.id})
    refresh_token = security.create_refresh_token(data={"sub": user.id})
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Log successful login
    log_security_event(
        db=db,
        event_type="LOGIN_SUCCESS",
        severity="INFO",
        description=f"User logged in: {user.username}",
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    logger.info(f"User logged in: {user.username}")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(
    token_data: schemas.TokenRefresh,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    """
    # Decode refresh token
    payload = security.decode_token(token_data.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify user exists and is active
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    new_access_token = security.create_access_token(data={"sub": user.id})
    new_refresh_token = security.create_refresh_token(data={"sub": user.id})
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout", response_model=ResponseModel)
async def logout(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Logout user (client should delete tokens).
    """
    # In a production app, you might want to blacklist the token
    return ResponseModel(
        success=True,
        message="Successfully logged out",
        data=None
    )
