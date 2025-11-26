from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.team import TeamRole

# Base schemas
class TeamBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None

# Member schemas
class TeamMemberBase(BaseModel):
    user_id: int
    role: TeamRole = TeamRole.MEMBER

class TeamMemberCreate(TeamMemberBase):
    email: str # Invite by email

class TeamMemberUpdate(BaseModel):
    role: TeamRole

class TeamMember(TeamMemberBase):
    team_id: int
    joined_at: datetime
    user: "UserSimple"

    class Config:
        from_attributes = True

# Response schemas
class Team(TeamBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    members: List[TeamMember] = []

    class Config:
        from_attributes = True

# Simple user schema (avoid circular import)
class UserSimple(BaseModel):
    id: int
    username: str
    full_name: Optional[str]
    email: str

    class Config:
        from_attributes = True

# Update forward refs
TeamMember.model_rebuild()
Team.model_rebuild()
