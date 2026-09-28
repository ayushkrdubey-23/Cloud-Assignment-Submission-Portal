from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.models.database import get_db
from backend.models.course import Course
from backend.models.user import User

from backend.schemas.course_schema import (
    CourseCreate,
    CourseResponse
)

from backend.services.auth_dependency import (
    get_current_user,
    require_teacher
)


router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
)


@router.post(
    "/",
    response_model=CourseResponse,
    status_code=201
)
def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Create a new course.

    Only authenticated teachers can create courses.
    """

    course = Course(
        course_name=course_data.course_name,
        teacher_id=current_user.user_id
    )

    db.add(course)
    db.commit()
    db.refresh(course)

    return course


@router.get(
    "/",
    response_model=list[CourseResponse]
)
def get_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return all available courses.

    Any authenticated student or teacher can view courses.
    """

    courses = db.query(Course).order_by(
        Course.course_id.desc()
    ).all()

    return courses


@router.get(
    "/my-courses",
    response_model=list[CourseResponse]
)
def get_my_courses(
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Return courses created by the authenticated teacher.
    """

    courses = db.query(Course).filter(
        Course.teacher_id == current_user.user_id
    ).order_by(
        Course.course_id.desc()
    ).all()

    return courses


@router.get(
    "/{course_id}",
    response_model=CourseResponse
)
def get_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return a single course by ID.
    """

    course = db.query(Course).filter(
        Course.course_id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


@router.delete(
    "/{course_id}",
    status_code=204
)
def delete_course(
    course_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Delete a course.

    A teacher can delete only courses created by that teacher.
    """

    course = db.query(Course).filter(
        Course.course_id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    if course.teacher_id != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own courses"
        )

    db.delete(course)
    db.commit()

    return None