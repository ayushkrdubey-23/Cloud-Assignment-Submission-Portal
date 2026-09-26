from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


class Assignment(Base):
    """
    Represents an assignment created by a teacher.
    """

    __tablename__ = "assignments"

    assignment_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.course_id"),
        nullable=False,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    deadline = Column(
        DateTime,
        nullable=False,
        index=True
    )

    max_marks = Column(
        Integer,
        nullable=False
    )

    allowed_file_types = Column(
        String(255),
        nullable=False,
        default=".pdf,.docx"
    )

    max_file_size_mb = Column(
        Integer,
        nullable=False,
        default=10
    )

    allow_late_submission = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_by = Column(
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
    course = relationship(
        "Course",
        back_populates="assignments"
    )

    submissions = relationship(
        "Submission",
        back_populates="assignment",
        cascade="all, delete-orphan"
    )