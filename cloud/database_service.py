from backend.models.database import Base, engine

# Import all models so SQLAlchemy registers them
from backend.models.user import User
from backend.models.course import Course
from backend.models.assignment import Assignment
from backend.models.submission import Submission


def initialize_database():
    """
    Create all database tables if they do not already exist.
    """

    Base.metadata.create_all(bind=engine)


def get_database_engine():
    """
    Return the configured SQLAlchemy engine.
    """

    return engine