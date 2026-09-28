from datetime import datetime

from pydantic import BaseModel, Field


class AssignmentCreate(BaseModel):

    course_id: int = Field(
        gt=0
    )

    title: str = Field(
        min_length=2,
        max_length=200
    )

    description: str = Field(
        min_length=5
    )

    deadline: datetime

    max_marks: int = Field(
        gt=0,
        le=1000
    )

    allowed_file_types: str = Field(
        min_length=1,
        max_length=255
    )

    max_file_size_mb: int = Field(
        gt=0,
        le=100
    )

    allow_late_submission: bool = False


class AssignmentUpdate(BaseModel):

    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=200
    )

    description: str | None = Field(
        default=None,
        min_length=5
    )

    deadline: datetime | None = None

    max_marks: int | None = Field(
        default=None,
        gt=0,
        le=1000
    )

    allowed_file_types: str | None = Field(
        default=None,
        min_length=1,
        max_length=255
    )

    max_file_size_mb: int | None = Field(
        default=None,
        gt=0,
        le=100
    )

    allow_late_submission: bool | None = None


class AssignmentResponse(BaseModel):

    assignment_id: int
    course_id: int
    title: str
    description: str
    deadline: datetime
    max_marks: int
    allowed_file_types: str
    max_file_size_mb: int
    allow_late_submission: bool
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True
        