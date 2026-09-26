from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    """
    Represents a student, teacher, or administrator.
    """

    __tablename__ = "users"

    user_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    role = Column(
        String(20),
        nullable=False,
        default="student"
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    courses = relationship(
        "Course",
        back_populates="teacher"
    )

    submissions = relationship(
        "Submission",
        back_populates="student"
    )