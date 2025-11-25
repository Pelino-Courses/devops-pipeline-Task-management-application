from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


# Base schemas
class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)


# Request schemas
class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength."""
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Schema for user update."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=255)
    theme_preference: Optional[str] = Field(None, pattern="^(system|light|dark)$")


class UserUpdateRole(BaseModel):
    """Schema for updating user role (admin only)."""
    role: UserRole


class UserUpdateStatus(BaseModel):
    """Schema for updating user status (admin only)."""
    is_active: bool


class PasswordChange(BaseModel):
    """Schema for password change."""
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8, max_length=100)
    
    @validator('new_password')
    def validate_password(cls, v):
        """Validate password strength."""
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v


# Response schemas
class User(UserBase):
    """Schema for user response."""
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    theme_preference: str
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True


class UserProfile(User):
    """Extended user profile schema."""
    updated_at: Optional[datetime]


# Token schemas
class Token(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str


class TokenPayload(BaseModel):
    """Schema for token payload."""
    sub: Optional[int] = None
    type: Optional[str] = None
