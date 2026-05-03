from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from core.database import get_db
from core.security import (
    hash_password, verify_password,
    create_access_token, decode_token,
    generate_otp, hash_otp, verify_otp,
)
from core.email import send_otp_email
from core.dependencies import get_current_user
from core.config import settings
from models.user import (
    SignupRequest, SigninRequest, GoogleAuthRequest,
    OTPRequest, UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])
bearer_scheme = HTTPBearer()


@router.post("/signup", status_code=201)
async def signup(body: SignupRequest, bg: BackgroundTasks, db=Depends(get_db)):
    if body.password != body.confirm_password:
        raise HTTPException(400, "Passwords do not match")
    if not body.agree_terms:
        raise HTTPException(400, "You must accept the terms of service")

    existing = await db.users.find_one({"email": body.email})
    if existing and existing.get("is_verified"):
        raise HTTPException(400, "Email already registered")

    pw_hash = hash_password(body.password)
    user_doc = {
        "name": body.name, "email": body.email,
        "password_hash": pw_hash,
        "phone": None, "bio": None,
        "is_verified": False, "onboarding_done": False,
        "auth_provider": "email",
        "preferences": {
            "currency": "INR ₹", "language": "English",
            "dark_mode": False, "email_notifications": True,
            "push_notifications": True,
        },
        "created_at": datetime.now(timezone.utc),
    }
    if existing:
        await db.users.update_one({"email": body.email}, {"$set": user_doc})
    else:
        await db.users.insert_one(user_doc)

    otp = generate_otp()
    await db.otp_store.delete_many({"email": body.email})
    await db.otp_store.insert_one({
        "email": body.email,
        "otp_hash": hash_otp(otp),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
    })
    await send_otp_email(body.email, otp, body.name)
    return {"message": "OTP sent to your email"}


@router.post("/signin")
async def signin(body: SigninRequest, db=Depends(get_db)):
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid email or password")
    if not user.get("is_verified"):
        raise HTTPException(403, "Please verify your email first")

    token = create_access_token(str(user["_id"]), remember_me=body.remember_me)
    return {"access_token": token, "token_type": "bearer", "user": UserResponse.from_mongo(user)}


@router.post("/google")
async def google_signin(body: GoogleAuthRequest, db=Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(
            body.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
        email     = idinfo.get("email")
        name      = idinfo.get("name", "")
        google_id = idinfo.get("sub")

        if not email:
            raise HTTPException(400, "Email not found in Google account")

        user = await db.users.find_one({"email": email})
        if not user:
            result = await db.users.insert_one({
                "name": name, "email": email,
                "password_hash": "", "phone": None, "bio": None,
                "is_verified": True, "onboarding_done": False,
                "auth_provider": "google", "google_id": google_id,
                "preferences": {
                    "currency": "INR ₹", "language": "English",
                    "dark_mode": False, "email_notifications": True,
                    "push_notifications": True,
                },
                "created_at": datetime.now(timezone.utc),
            })
            user = await db.users.find_one({"_id": result.inserted_id})
        else:
            updates = {"is_verified": True}
            if not user.get("google_id"):
                updates["google_id"] = google_id
            await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
            user = await db.users.find_one({"_id": user["_id"]})

        token = create_access_token(str(user["_id"]))
        return {
            "access_token": token, "token_type": "bearer",
            "user": UserResponse.from_mongo(user),
            "is_new_user": not user.get("onboarding_done", False),
        }
    except ValueError as e:
        raise HTTPException(401, f"Invalid Google token: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Google authentication failed: {str(e)}")


@router.post("/verify-otp")
async def verify_otp_endpoint(body: OTPRequest, db=Depends(get_db)):
    record = await db.otp_store.find_one({"email": body.email})
    if not record:
        raise HTTPException(400, "OTP not found or expired. Request a new one.")
    if not verify_otp(body.otp, record["otp_hash"]):
        raise HTTPException(400, "Invalid OTP. Check and try again.")

    await db.users.update_one({"email": body.email}, {"$set": {"is_verified": True}})
    await db.otp_store.delete_many({"email": body.email})

    user  = await db.users.find_one({"email": body.email})
    token = create_access_token(str(user["_id"]))
    return {"access_token": token, "token_type": "bearer", "user": UserResponse.from_mongo(user)}


@router.post("/resend-otp")
async def resend_otp(body: dict, db=Depends(get_db)):
    """Resend OTP — called from the OTP screen's 'Resend code' button."""
    email = (body.get("email") or "").strip()
    if not email:
        raise HTTPException(400, "Email required")

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "No account found with this email")
    if user.get("is_verified"):
        raise HTTPException(400, "Email already verified. Please sign in.")

    otp = generate_otp()
    await db.otp_store.delete_many({"email": email})
    await db.otp_store.insert_one({
        "email": email,
        "otp_hash": hash_otp(otp),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
    })
    await send_otp_email(email, otp, user.get("name", "there"))
    return {"message": "New OTP sent to your email"}


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
):
    """Blacklist the JWT so it cannot be reused after logout."""
    token = credentials.credentials
    try:
        payload = decode_token(token)
        expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        existing = await db.token_blacklist.find_one({"token": token})
        if not existing:
            await db.token_blacklist.insert_one({
                "token": token,
                "expires_at": expires_at,
            })
    except Exception:
        pass  # Token already invalid — still return success
    return {"message": "Logged out successfully"}