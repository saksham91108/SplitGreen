from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CreateGroupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    default_split: str = "equally"


class UpdateGroupRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    default_split: Optional[str] = None


class AddMemberRequest(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None


class GroupResponse(BaseModel):
    id: str
    name: str
    members: List[dict]
    expenses_count: int = 0
    balance: float = 0.0
    default_split: str
    invite_code: Optional[str] = None
    created_by: str
    created_at: datetime

    @classmethod
    def from_mongo(
        cls, doc: dict,
        balance: float = 0.0,
        expenses_count: int = 0
    ) -> "GroupResponse":
        return cls(
            id=str(doc["_id"]),
            name=doc["name"],
            members=doc.get("members", []),
            expenses_count=expenses_count,
            balance=balance,
            default_split=doc.get("default_split", "equally"),
            invite_code=doc.get("invite_code"),
            created_by=str(doc.get("created_by", "")),
            created_at=doc.get("created_at", datetime.utcnow()),
        )


class BalanceEntry(BaseModel):
    user_id: str
    name: str
    owes_you: float = 0.0
    you_owe: float = 0.0
    net: float = 0.0