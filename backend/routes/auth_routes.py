from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.models.database import get_db
from backend.models.user import User

from backend.schemas.user_schema import (
    UserRegister,
    UserLogin
)

from cloud.auth_service import (
    create_user,
    authenticate_user
)

from backend.services.security_service import (
    create_access_token
)

from backend.services.auth_dependency import (
    get_current_user,
    require_student,
    require_teacher
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new student or teacher account.
    """

    new_user = create_user(
        db,
        user.name,
        user.email,
        user.password,
        user.role
    )

    if not new_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return {
        "message": "User created",
        "user_id": new_user.user_id
    }


@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    """
    JSON login endpoint for the frontend.
    """

    db_user = authenticate_user(
        db,
        user.email,
        user.password
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {
            "user_id": db_user.user_id,
            "role": db_user.role,
            "email": db_user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role,
        "name": db_user.name
    }


@router.post("/token")
def token_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2-compatible login endpoint used by Swagger UI.
    
    Swagger sends the username field as the user's email.
    """

    db_user = authenticate_user(
        db,
        form_data.username,
        form_data.password
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    token = create_access_token(
        {
            "user_id": db_user.user_id,
            "role": db_user.role,
            "email": db_user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Return the profile of the currently authenticated user.
    """

    return {
        "user_id": current_user.user_id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


@router.get("/student-test")
def student_test(
    current_user: User = Depends(require_student)
):
    """
    Protected endpoint accessible only to students.
    """

    return {
        "message": "Student authorization successful",
        "user_id": current_user.user_id,
        "role": current_user.role
    }


@router.get("/teacher-test")
def teacher_test(
    current_user: User = Depends(require_teacher)
):
    """
    Protected endpoint accessible only to teachers.
    """

    return {
        "message": "Teacher authorization successful",
        "user_id": current_user.user_id,
        "role": current_user.role
    }