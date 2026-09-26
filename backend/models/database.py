from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os


# Load environment variables
load_dotenv()


# Read database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./assignment_portal.db"
)


# SQLite requires this option for FastAPI's request-based usage.
# It allows the same SQLite database connection to be used safely
# across different threads.
connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }


# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)


# Create database session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for all database models
Base = declarative_base()


def get_db():
    """
    Provide a database session to FastAPI routes.

    The session is automatically closed after the request
    finishes.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()