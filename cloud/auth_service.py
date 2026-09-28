from sqlalchemy.orm import Session

from backend.models.user import User
from backend.services.security_service import (
    hash_password,
    verify_password
)


def create_user(
    db: Session,
    name: str,
    email: str,
    password: str,
    role: str
):

    existing = db.query(User).filter(
        User.email == email
    ).first()

    if existing:
        return None

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str
):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    return user