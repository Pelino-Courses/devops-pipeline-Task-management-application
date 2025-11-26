from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Team, TeamMember, User, TeamRole
from app.schemas import team as schemas
from app.api.deps import get_current_active_user

router = APIRouter()

@router.post("", response_model=schemas.Team, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_in: schemas.TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new team. Current user becomes the owner.
    """
    new_team = Team(
        name=team_in.name,
        description=team_in.description
    )
    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    # Add creator as owner
    member = TeamMember(
        team_id=new_team.id,
        user_id=current_user.id,
        role=TeamRole.OWNER
    )
    db.add(member)
    db.commit()
    db.refresh(new_team)
    
    return new_team

@router.get("", response_model=List[schemas.Team])
async def get_my_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get all teams the current user is a member of.
    """
    # Query teams via the association
    teams = db.query(Team).join(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    return teams

@router.get("/{team_id}", response_model=schemas.Team)
async def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get specific team details.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check membership
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not member and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not a member of this team")
        
    return team

@router.post("/{team_id}/members", response_model=schemas.TeamMember)
async def add_member(
    team_id: int,
    member_in: schemas.TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Add a member to the team by email. Only admins/owners can add.
    """
    # Check permissions
    current_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not current_member or current_member.role not in [TeamRole.OWNER, TeamRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to add members")
        
    # Find user to add
    user_to_add = db.query(User).filter(User.email == member_in.email).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if already member
    existing = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_to_add.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already in team")
        
    new_member = TeamMember(
        team_id=team_id,
        user_id=user_to_add.id,
        role=member_in.role
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return new_member

@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Remove a member from the team.
    """
    # Check permissions
    current_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not current_member or current_member.role not in [TeamRole.OWNER, TeamRole.ADMIN]:
        # Allow users to leave themselves
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to remove members")
            
    member_to_remove = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    
    if not member_to_remove:
        raise HTTPException(status_code=404, detail="Member not found")
        
    if member_to_remove.role == TeamRole.OWNER and db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.role == TeamRole.OWNER).count() == 1:
         raise HTTPException(status_code=400, detail="Cannot remove the only owner")

    db.delete(member_to_remove)
    db.commit()
    return None
