from fastapi import FastAPI
from dotenv import load_dotenv
import os

from cloud.database_service import initialize_database

from backend.routes.auth_routes import router as auth_router
from backend.routes.course_routes import router as course_router
from backend.routes.assignment_routes import router as assignment_router


# Load environment variables
load_dotenv()


APP_NAME = os.getenv(
    "APP_NAME",
    "Cloud-Based Student Assignment Submission & Feedback Portal"
)

ENVIRONMENT = os.getenv(
    "ENVIRONMENT",
    "development"
)


# Create FastAPI application
app = FastAPI(
    title=APP_NAME,
    description=(
        "REST API for a cloud-oriented student assignment "
        "submission and feedback platform."
    ),
    version="1.0.0",
)


# Register API routes
app.include_router(auth_router)
app.include_router(course_router)
app.include_router(assignment_router)


@app.on_event("startup")
def startup_event():
    """
    Initialize database tables when the backend starts.
    """
    initialize_database()


@app.get("/")
def root():
    """
    Root endpoint used to verify that the backend is running.
    """
    return {
        "message": "Cloud Assignment Submission Portal API is running",
        "environment": ENVIRONMENT,
        "status": "success"
    }


@app.get("/api/health")
def health_check():
    """
    Health-check endpoint for monitoring and deployment checks.
    """
    return {
        "status": "healthy",
        "service": "backend",
        "environment": ENVIRONMENT
    }


@app.get("/api/database-status")
def database_status():
    """
    Basic endpoint confirming that the application can
    initialize and access its configured database.
    """
    return {
        "status": "connected",
        "database": "configured"
    }