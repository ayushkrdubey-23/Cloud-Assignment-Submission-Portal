from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


class Submission(Base):
    """
    Represents a student's assignment submission.

    Multiple submissions can exist for the same assignment.
    Each submission receives a version number so that
    resubmissions can be tracked without overwriting
    previous files.
    """

    __tablename__ = "submissions"

    submission_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    assignment_id = Column(
        Integer,
        ForeignKey("assignments.assignment_id"),
        nullable=False,
        index=True
    )

    student_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    version_number = Column(
        Integer,
        nullable=False,
        default=1
    )

    file_name = Column(
        String(255),
        nullable=False
    )

    file_url = Column(
        String(1000),
        nullable=True
    )

    storage_path = Column(
        String(1000),
        nullable=False
    )

    submitted_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    submission_status = Column(
        String(30),
        nullable=False,
        default="SUBMITTED"
    )

    marks = Column(
        Integer,
        nullable=True
    )

    feedback = Column(
        Text,
        nullable=True
    )

    graded_at = Column(
        DateTime,
        nullable=True
    )

    assignment = relationship(
        "Assignment",
        back_populates="submissions"
    )

    student = relationship(
        "User",
        back_populates="submissions"
    )