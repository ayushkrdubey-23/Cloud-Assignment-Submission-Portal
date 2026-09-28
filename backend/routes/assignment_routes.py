from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.models.database import get_db
from backend.models.user import User
from backend.models.course import Course
from backend.models.assignment import Assignment

from backend.schemas.assignment_schema import (
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentResponse
)

from backend.services.auth_dependency import (
    get_current_user,
    require_teacher
)


router = APIRouter(
    prefix="/api/assignments",
    tags=["Assignments"]
)


@router.post(
    "/",
    response_model=AssignmentResponse,
    status_code=201
)
def create_assignment(
    assignment_data: AssignmentCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Create an assignment inside a course.

    Only the teacher who owns the course can create
    assignments for that course.
    """

    course = db.query(Course).filter(
        Course.course_id == assignment_data.course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if course.teacher_id != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only create assignments for your own courses"
        )

    assignment = Assignment(
        course_id=assignment_data.course_id,
        title=assignment_data.title,
        description=assignment_data.description,
        deadline=assignment_data.deadline,
        max_marks=assignment_data.max_marks,
        allowed_file_types=assignment_data.allowed_file_types,
        max_file_size_mb=assignment_data.max_file_size_mb,
        allow_late_submission=assignment_data.allow_late_submission,
        created_by=current_user.user_id
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return assignment


@router.get(
    "/",
    response_model=list[AssignmentResponse]
)
def get_assignments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return all assignments.

    Any authenticated student or teacher can view assignments.
    """

    assignments = db.query(
        Assignment
    ).order_by(
        Assignment.deadline.asc()
    ).all()

    return assignments


@router.get(
    "/course/{course_id}",
    response_model=list[AssignmentResponse]
)
def get_course_assignments(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return all assignments belonging to a specific course.
    """

    course = db.query(Course).filter(
        Course.course_id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    assignments = db.query(
        Assignment
    ).filter(
        Assignment.course_id == course_id
    ).order_by(
        Assignment.deadline.asc()
    ).all()

    return assignments


@router.get(
    "/{assignment_id}",
    response_model=AssignmentResponse
)
def get_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return a single assignment.
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

    return assignment


@router.put(
    "/{assignment_id}",
    response_model=AssignmentResponse
)
def update_assignment(
    assignment_id: int,
    assignment_data: AssignmentUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Update an assignment.

    Only the teacher who created the assignment can update it.
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

    if assignment.created_by != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own assignments"
        )

    update_data = assignment_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            assignment,
            field,
            value
        )

    db.commit()
    db.refresh(assignment)

    return assignment


@router.delete(
    "/{assignment_id}",
    status_code=204
)
def delete_assignment(
    assignment_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Delete an assignment.

    Only the teacher who created the assignment can delete it.
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

    if assignment.created_by != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own assignments"
        )

    db.delete(assignment)
    db.commit()

    return None