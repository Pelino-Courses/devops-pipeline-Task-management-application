from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class TaskPriority(str, enum.Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatus(str, enum.Enum):
    """Task status states."""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Task(Base):
    """Task model for task management."""
    
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    priority = Column(SQLEnum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False, index=True)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.TODO, nullable=False, index=True)
    category = Column(String(100), nullable=True, index=True)
    tags = Column(Text, nullable=True)  # Comma-separated tags
    
    # Dates
    due_date = Column(DateTime(timezone=True), nullable=True)
    reminder_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign Keys
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="tasks")
    attachments = relationship("Attachment", back_populates="task", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Task {self.title}>"
