from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import uuid
from app.models.enums import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True
