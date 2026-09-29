from datetime import datetime

from pydantic import BaseModel


class SubmissionResponse(BaseModel):
    """
    Response schema for a student assignment submission.
    """

    submission_id: int
    assignment_id: int
    student_id: int

    version_number: int

    file_name: str
    file_url: str | None
    storage_path: str

    submitted_at: datetime
    submission_status: str

    marks: int | None
    feedback: str | None
    graded_at: datetime | None

    class Config:
        from_attributes = True