from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class Preferences(BaseModel):
    currency: str = "INR ₹"
    language: str = "English"
    dark_mode: bool = False
    email_notifications: bool = True
    push_notifications: bool = True


# ── Auth request bodies ───────────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str
    agree_terms: bool


class SigninRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class GoogleAuthRequest(BaseModel):
    credential: str  # Google JWT token


class OTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


# ── User update bodies ────────────────────────────────────────

class UpdateUserRequest(BaseModel):
    name:  Optional[str]      = Field(None, min_length=2, max_length=80)
    email: Optional[EmailStr] = None
    phone: Optional[str]      = None
    bio:   Optional[str]      = Field(None, max_length=200)


class UpdatePreferencesRequest(BaseModel):
    currency:            Optional[str]  = None
    language:            Optional[str]  = None
    dark_mode:           Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications:  Optional[bool] = None


# ── Responses ─────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    onboarding_done: bool = False
    preferences: Preferences = Preferences()
    created_at: datetime

    @classmethod
    def from_mongo(cls, doc: dict) -> "UserResponse":
        return cls(
            id=str(doc["_id"]),
            name=doc["name"],
            email=doc["email"],
            phone=doc.get("phone"),
            bio=doc.get("bio"),
            onboarding_done=doc.get("onboarding_done", False),
            preferences=Preferences(**doc.get("preferences", {})),
            created_at=doc.get("created_at", datetime.utcnow()),
        )


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class StatsResponse(BaseModel):
    groups_count: int
    total_split: float
    settlements_count: int
