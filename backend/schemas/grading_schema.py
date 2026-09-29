from datetime import datetime

from pydantic import BaseModel, Field


class GradeSubmission(BaseModel):
    """
    Data required by a teacher to grade a submission.
    """

    marks: int = Field(
        ge=0,
        le=1000
    )

    feedback: str | None = Field(
        default=None,
        max_length=5000
    )


class GradedSubmissionResponse(BaseModel):
    """
    Response returned after a submission has been graded.
    """

    submission_id: int
    assignment_id: int
    student_id: int

    version_number: int

    file_name: str
    submitted_at: datetime
    submission_status: str

    marks: int | None
    feedback: str | None
    graded_at: datetime | None

    class Config:
        from_attributes = True