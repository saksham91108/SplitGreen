from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from core.config import settings
import random
import string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Password hashing
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# JWT tokens
def create_access_token(user_id: str, remember_me: bool = False) -> str:
    if remember_me:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REMEMBER_EXPIRE_DAYS)
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])


# OTP
def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

def hash_otp(otp: str) -> str:
    return pwd_context.hash(otp)

def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    return pwd_context.verify(plain_otp, hashed_otp)
