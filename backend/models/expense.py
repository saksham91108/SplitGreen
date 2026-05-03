from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class CreateExpenseRequest(BaseModel):
    desc: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    group_id: str
    paid_by_user_id: str
    date: str
    category: str = "📦"
    tags: List[str] = []
    split_type: str = "equally"
    split_data: Optional[Dict[str, float]] = None


class ExpenseResponse(BaseModel):
    id: str
    desc: str
    amount: float
    paid_by_user_id: str
    paid_by_name: str = ""
    group_id: str
    group_name: str = ""
    date: str
    category: str
    tags: List[str] = []
    split_type: str
    split_data: Dict[str, float] = {}
    your_share: float = 0.0
    receipt_id: Optional[str] = None
    created_at: datetime

    @classmethod
    def from_mongo(
        cls, doc: dict,
        your_share: float = 0.0,
        paid_by_name: str = "",
        group_name: str = ""
    ) -> "ExpenseResponse":
        return cls(
            id=str(doc["_id"]),
            desc=doc["desc"],
            amount=doc["amount"],
            paid_by_user_id=str(doc["paid_by_user_id"]),
            paid_by_name=paid_by_name,
            group_id=str(doc["group_id"]),
            group_name=group_name,
            date=doc["date"],
            category=doc.get("category", "📦"),
            tags=doc.get("tags", []),
            split_type=doc.get("split_type", "equally"),
            split_data={
                str(k): v
                for k, v in doc.get("split_data", {}).items()
            },
            your_share=your_share,
            receipt_id=str(doc["receipt_id"]) if doc.get("receipt_id") else None,
            created_at=doc.get("created_at", datetime.utcnow()),
        )


class SharePreviewResponse(BaseModel):
    per_person: Dict[str, float]
    total: float