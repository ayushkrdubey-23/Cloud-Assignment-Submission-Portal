from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=72
    )

    role: Literal[
        "student",
        "teacher"
    ]


class UserLogin(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    user_id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):

    access_token: str
    token_type: str