from .auth_routes import router as auth_router
from .course_routes import router as course_router

__all__ = [
    "auth_router",
    "course_router",
]