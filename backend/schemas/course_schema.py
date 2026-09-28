from datetime import datetime

from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    course_name: str = Field(
        min_length=2,
        max_length=150
    )


class CourseResponse(BaseModel):
    course_id: int
    course_name: str
    teacher_id: int
    created_at: datetime

    class Config:
        from_attributes = True