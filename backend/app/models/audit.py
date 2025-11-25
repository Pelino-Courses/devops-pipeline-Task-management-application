from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ActivityLog(Base):
    """Activity log model for audit trail."""
    
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # CREATE, UPDATE, DELETE, etc.
    entity_type = Column(String(50), nullable=False, index=True)  # Task, User, etc.
    entity_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    changes = Column(JSON, nullable=True)  # Store before/after values
    ip_address = Column(String(45), nullable=True)  # Support IPv6
    user_agent = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="activity_logs")
    
    def __repr__(self):
        return f"<ActivityLog {self.action} {self.entity_type}>"


class SecurityEvent(Base):
    """Security event model for tracking security-related activities."""
    
    __tablename__ = "security_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)  # LOGIN_SUCCESS, LOGIN_FAILED, etc.
    severity = Column(String(20), nullable=False, index=True)  # INFO, WARNING, CRITICAL
    description = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    metadata = Column(JSON, nullable=True)  # Additional event data
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="security_events")
    
    def __repr__(self):
        return f"<SecurityEvent {self.event_type}>"
