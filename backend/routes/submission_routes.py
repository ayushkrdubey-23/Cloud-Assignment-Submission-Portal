from datetime import datetime, timezone
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.models.database import get_db
from backend.models.user import User
from backend.models.assignment import Assignment
from backend.models.submission import Submission
from backend.models.course import Course

from backend.schemas.submission_schema import (
    SubmissionResponse
)

from backend.services.auth_dependency import (
    get_current_user,
    require_student
)

from cloud.storage_service import (
    save_file
)


router = APIRouter(
    prefix="/api/submissions",
    tags=["Submissions"]
)


# ---------------------------------------------------------
# Helper: Parse allowed file extensions
# ---------------------------------------------------------

def get_allowed_extensions(
    allowed_file_types: str
) -> set[str]:
    """
    Convert the assignment's allowed file types
    into a normalized set.
    """

    extensions = set()

    for file_type in allowed_file_types.split(","):
        extension = file_type.strip().lower()

        if not extension:
            continue

        if not extension.startswith("."):
            extension = f".{extension}"

        extensions.add(extension)

    return extensions


# ---------------------------------------------------------
# Helper: Validate file size
# ---------------------------------------------------------

async def read_file_with_size_limit(
    file: UploadFile,
    max_file_size_mb: int
) -> bytes:
    """
    Read the uploaded file while enforcing the
    assignment's maximum file size.
    """

    max_size_bytes = (
        max_file_size_mb
        * 1024
        * 1024
    )

    content = bytearray()

    while True:
        chunk = await file.read(1024 * 1024)

        if not chunk:
            break

        content.extend(chunk)

        if len(content) > max_size_bytes:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"File size exceeds the maximum "
                    f"allowed size of "
                    f"{max_file_size_mb} MB"
                )
            )

    return bytes(content)


# ---------------------------------------------------------
# Upload assignment submission
# ---------------------------------------------------------

@router.post(
    "/assignment/{assignment_id}",
    response_model=SubmissionResponse,
    status_code=201
)
async def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Submit an assignment file.

    Every submission receives a new version number.
    Previous submissions are preserved.
    """

    # -----------------------------------------------------
    # Find assignment
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Validate filename
    # -----------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="A file is required"
        )

    original_filename = Path(
        file.filename
    ).name

    if not original_filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid file name"
        )

    # -----------------------------------------------------
    # Validate file extension
    # -----------------------------------------------------

    file_extension = Path(
        original_filename
    ).suffix.lower()

    allowed_extensions = get_allowed_extensions(
        assignment.allowed_file_types
    )

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                f"File type '{file_extension}' is not allowed. "
                f"Allowed types: "
                f"{', '.join(sorted(allowed_extensions))}"
            )
        )

    # -----------------------------------------------------
    # Check deadline
    # -----------------------------------------------------

    current_time = datetime.now(
        timezone.utc
    )

    deadline = assignment.deadline

    if deadline.tzinfo is None:
        deadline = deadline.replace(
            tzinfo=timezone.utc
        )

    is_late = current_time > deadline

    if (
        is_late
        and not assignment.allow_late_submission
    ):
        raise HTTPException(
            status_code=400,
            detail="The submission deadline has passed"
        )

    # -----------------------------------------------------
    # Read and validate file size
    # -----------------------------------------------------

    file_content = await read_file_with_size_limit(
        file,
        assignment.max_file_size_mb
    )

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    # -----------------------------------------------------
    # Calculate next version number
    # -----------------------------------------------------

    latest_submission = db.query(
        Submission
    ).filter(
        Submission.assignment_id
        == assignment.assignment_id,
        Submission.student_id
        == current_user.user_id
    ).order_by(
        Submission.version_number.desc()
    ).first()

    if latest_submission:
        next_version = (
            latest_submission.version_number + 1
        )
    else:
        next_version = 1

    # -----------------------------------------------------
    # Save file
    # -----------------------------------------------------

    try:
        storage_path = save_file(
            file_content=file_content,
            assignment_id=assignment.assignment_id,
            student_id=current_user.user_id,
            original_filename=original_filename
        )

    except OSError as error:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Could not save the uploaded file: {error}"
            )
        )

    # -----------------------------------------------------
    # Create submission record
    # -----------------------------------------------------

    submission_status = (
        "LATE"
        if is_late
        else "SUBMITTED"
    )

    submission = Submission(
        assignment_id=assignment.assignment_id,
        student_id=current_user.user_id,
        version_number=next_version,
        file_name=original_filename,
        file_url=None,
        storage_path=str(storage_path),
        submitted_at=current_time,
        submission_status=submission_status
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission


# ---------------------------------------------------------
# Get student's own submissions
# ---------------------------------------------------------

@router.get(
    "/my-submissions",
    response_model=list[SubmissionResponse]
)
def get_my_submissions(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Return all submissions created by the
    authenticated student.

    Results are ordered from newest version
    to oldest version.
    """

    submissions = db.query(
        Submission
    ).filter(
        Submission.student_id == current_user.user_id
    ).order_by(
        Submission.submitted_at.desc()
    ).all()

    return submissions


# ---------------------------------------------------------
# Get submission history for one assignment
# ---------------------------------------------------------

@router.get(
    "/assignment/{assignment_id}/history",
    response_model=list[SubmissionResponse]
)
def get_submission_history(
    assignment_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Return all versions submitted by the authenticated
    student for a specific assignment.
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

    submissions = db.query(
        Submission
    ).filter(
        Submission.assignment_id == assignment_id,
        Submission.student_id == current_user.user_id
    ).order_by(
        Submission.version_number.desc()
    ).all()

    return submissions


# ---------------------------------------------------------
# Get a specific student's submission
# ---------------------------------------------------------

@router.get(
    "/{submission_id}",
    response_model=SubmissionResponse
)
def get_my_submission(
    submission_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Return one submission belonging to the
    authenticated student.
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

    if submission.student_id != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own submissions"
        )

    return submission


# ---------------------------------------------------------
# Secure file download
# ---------------------------------------------------------

@router.get(
    "/{submission_id}/download"
)
def download_submission_file(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Securely download a submitted assignment file.

    Students can download their own files.

    Teachers can download files belonging to
    assignments inside their own courses.
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

    # -----------------------------------------------------
    # Student authorization
    # -----------------------------------------------------

    if current_user.role == "student":

        if submission.student_id != current_user.user_id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only download "
                    "your own submission files"
                )
            )

    # -----------------------------------------------------
    # Teacher authorization
    # -----------------------------------------------------

    elif current_user.role == "teacher":

        assignment = db.query(
            Assignment
        ).filter(
            Assignment.assignment_id
            == submission.assignment_id
        ).first()

        if not assignment:
            raise HTTPException(
                status_code=404,
                detail="Assignment not found"
            )

        course = db.query(
            Course
        ).filter(
            Course.course_id
            == assignment.course_id
        ).first()

        if not course:
            raise HTTPException(
                status_code=404,
                detail="Course not found"
            )

        if course.teacher_id != current_user.user_id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only download submissions "
                    "from your own courses"
                )
            )

    else:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to download files"
        )

    # -----------------------------------------------------
    # Validate stored path
    # -----------------------------------------------------

    file_path = Path(
        submission.storage_path
    )

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Stored submission file not found"
        )

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Stored submission file is invalid"
        )

    # -----------------------------------------------------
    # Return file
    # -----------------------------------------------------

    return FileResponse(
        path=file_path,
        filename=submission.file_name,
        media_type="application/octet-stream"
    )