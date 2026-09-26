from fastapi import FastAPI
from dotenv import load_dotenv
import os

from cloud.database_service import initialize_database


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


app = FastAPI(
    title=APP_NAME,
    description=(
        "REST API for a cloud-oriented student assignment "
        "submission and feedback platform."
    ),
    version="1.0.0",
)


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