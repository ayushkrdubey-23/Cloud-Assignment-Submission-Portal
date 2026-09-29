from .auth_routes import router as auth_router
from .course_routes import router as course_router
from .assignment_routes import router as assignment_router
from .submission_routes import router as submission_router
from .grading_routes import router as grading_router


__all__ = [
    "auth_router",
    "course_router",
    "assignment_router",
    "submission_router",
    "grading_router",
]