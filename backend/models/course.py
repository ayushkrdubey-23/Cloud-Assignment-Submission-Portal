from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class Course(Base):
    """
    Represents a course managed by a teacher.
    """

    __tablename__ = "courses"

    course_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    course_name = Column(
        String(150),
        nullable=False
    )

    teacher_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    teacher = relationship(
        "User",
        back_populates="courses"
    )

    assignments = relationship(
        "Assignment",
        back_populates="course",
        cascade="all, delete-orphan"
    )