from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.models.database import get_db
from backend.models.user import User
from backend.models.course import Course
from backend.models.assignment import Assignment
from backend.models.submission import Submission

from backend.schemas.grading_schema import (
    GradeSubmission,
    GradedSubmissionResponse
)

from backend.services.auth_dependency import (
    require_teacher
)


router = APIRouter(
    prefix="/api/grading",
    tags=["Grading"]
)


# ---------------------------------------------------------
# Helper: Verify teacher owns the assignment
# ---------------------------------------------------------

def get_teacher_assignment(
    assignment_id: int,
    teacher_id: int,
    db: Session
):
    """
    Find an assignment and verify that the authenticated
    teacher owns the course containing that assignment.
    """

    assignment = db.query(
        Assignment
    ).filter(
        Assignment.assignment_id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    course = db.query(
        Course
    ).filter(
        Course.course_id == assignment.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course associated with assignment not found"
        )

    if course.teacher_id != teacher_id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You can only manage submissions "
                "for your own courses"
            )
        )

    return assignment


# ---------------------------------------------------------
# View submissions for an assignment
# ---------------------------------------------------------

@router.get(
    "/assignment/{assignment_id}",
    response_model=list[GradedSubmissionResponse]
)
def get_assignment_submissions(
    assignment_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Return all student submissions for an assignment.

    Only the teacher who owns the assignment's course
    can access these submissions.
    """

    assignment = get_teacher_assignment(
        assignment_id=assignment_id,
        teacher_id=current_user.user_id,
        db=db
    )

    submissions = db.query(
        Submission
    ).filter(
        Submission.assignment_id == assignment.assignment_id
    ).order_by(
        Submission.submitted_at.desc()
    ).all()

    return submissions


# ---------------------------------------------------------
# Grade a submission
# ---------------------------------------------------------

@router.put(
    "/submission/{submission_id}",
    response_model=GradedSubmissionResponse
)
def grade_submission(
    submission_id: int,
    grading_data: GradeSubmission,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Grade a student submission.

    Only the teacher who owns the related course
    can grade the submission.
    """

    # -----------------------------------------------------
    # Find submission
    # -----------------------------------------------------

    submission = db.query(
        Submission
    ).filter(
        Submission.submission_id == submission_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    # -----------------------------------------------------
    # Find assignment and verify teacher ownership
    # -----------------------------------------------------

    assignment = get_teacher_assignment(
        assignment_id=submission.assignment_id,
        teacher_id=current_user.user_id,
        db=db
    )

    # -----------------------------------------------------
    # Validate marks
    # -----------------------------------------------------

    if grading_data.marks > assignment.max_marks:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Marks cannot exceed the assignment maximum "
                f"of {assignment.max_marks}"
            )
        )

    # -----------------------------------------------------
    # Update grading information
    # -----------------------------------------------------

    submission.marks = grading_data.marks

    submission.feedback = (
        grading_data.feedback
    )

    submission.graded_at = datetime.now(
        timezone.utc
    )

    submission.submission_status = "GRADED"

    db.commit()
    db.refresh(submission)

    return submission


# ---------------------------------------------------------
# View one submission for grading
# ---------------------------------------------------------

@router.get(
    "/submission/{submission_id}",
    response_model=GradedSubmissionResponse
)
def get_submission_for_grading(
    submission_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Return a specific submission for a teacher.

    The teacher must own the course associated with
    the submission's assignment.
    """

    submission = db.query(
        Submission
    ).filter(
        Submission.submission_id == submission_id
    ).first()

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )

    get_teacher_assignment(
        assignment_id=submission.assignment_id,
        teacher_id=current_user.user_id,
        db=db
    )

    return submission
