"""Pydantic schemas for authentication requests and responses."""

from __future__ import annotations

import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the user")
    email: str = Field(..., max_length=255, description="Work or business email address")
    password: str = Field(..., min_length=8, max_length=128, description="Account password")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$", clean):
            raise ValueError("Please provide a valid email address.")
        return clean

    @field_validator("name")
    @classmethod
    def validate_name_clean(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 2:
            raise ValueError("Full name must be at least 2 characters.")
        return clean


class LoginRequest(BaseModel):
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class AuthUser(BaseModel):
    id: UUID
    name: str
    email: str
    business_id: UUID
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    user: AuthUser
    expires_at: str


class MessageResponse(BaseModel):
    message: str
