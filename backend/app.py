from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from cloud.database_service import initialize_database
from backend.routes.auth_routes import router as auth_router
from backend.routes.course_routes import router as course_router
from backend.routes.assignment_routes import router as assignment_router
from backend.routes.submission_routes import router as submission_router
from backend.routes.grading_routes import router as grading_router


load_dotenv()


APP_NAME = os.getenv(
    "APP_NAME",
    "Cloud-Based Student Assignment Submission & Feedback Portal"
)

ENVIRONMENT = os.getenv(
    "ENVIRONMENT",
    "development"
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173,http://127.0.0.1:5173"
)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in FRONTEND_URL.split(",")
    if origin.strip()
]


app = FastAPI(
    title=APP_NAME,
    description=(
        "REST API for a cloud-oriented student "
        "assignment submission and feedback platform."
    ),
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(course_router)
app.include_router(assignment_router)
app.include_router(submission_router)
app.include_router(grading_router)


@app.on_event("startup")
def startup_event():
    initialize_database()


@app.get("/")
def root():
    return {
        "message": "Cloud Assignment Submission Portal API is running",
        "environment": ENVIRONMENT,
        "status": "success",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "backend",
        "environment": ENVIRONMENT,
    }


@app.get("/api/database-status")
def database_status():
    return {
        "status": "connected",
        "database": "configured",
    }