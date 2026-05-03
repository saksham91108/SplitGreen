from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from datetime import datetime
from bson import ObjectId
import secrets

from core.database import get_db
from core.dependencies import get_current_user
from services.receipt_parser import parse_receipt_text
from services.split_calc import calculate_by_item_split, calculate_split

router = APIRouter(prefix="/receipts", tags=["Receipts"])


# ── Step 1: Parse raw text from Tesseract.js ──────────────────
# Frontend runs Tesseract.js in browser → gets raw_text string
# Sends that string here → Groq parses it → returns structured items

@router.post("/parse")
async def parse_receipt(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Receives raw OCR text from Tesseract.js running in the browser.
    Sends it to Groq to extract structured items.
    Nothing is saved yet — user reviews on frontend first.

    Body: { "raw_text": "..." }
    """
    raw_text = data.get("raw_text", "").strip()

    if not raw_text or len(raw_text) < 5:
        raise HTTPException(
            400,
            "raw_text is empty or too short. "
            "Try scanning a clearer image."
        )

    try:
        parsed = await parse_receipt_text(raw_text)
        return parsed

    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Parsing failed: {str(e)}")


# ── Step 2: User reviewed → confirm → create expense ─────────

@router.post("/confirm")
async def confirm_receipt(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    User reviewed and confirmed items + assignments on frontend.
    Now create the expense and save the receipt record.

    Body:
    {
        "group_id": "...",
        "paid_by_user_id": "...",
        "date": "2026-04-11",
        "merchant": "Pizza Palace",
        "total": 542.80,
        "subtotal": 460.00,
        "tax": 82.80,
        "tip": 0.0,
        "items": [{id, name, amount}],
        "split_type": "equally" | "by_item",
        "item_assignments": {"item_id": ["user_id"]},  ← by_item only
        "split_members": ["user_id", ...]               ← equally only
    }
    """
    try:
        group_id   = data["group_id"]
        total      = float(data["total"])
        split_type = data.get("split_type", "equally")
        merchant   = data.get("merchant", "Receipt Expense")
        date       = data.get("date", datetime.utcnow().strftime("%Y-%m-%d"))

        # Verify group exists
        group = await db.groups.find_one({"_id": ObjectId(group_id)})
        if not group:
            raise HTTPException(404, "Group not found")

        member_ids = [m["user_id"] for m in group.get("members", [])]
        user_id    = str(current_user["_id"])

        if user_id not in member_ids:
            raise HTTPException(403, "You are not in this group")

        # Calculate split
        if split_type == "by_item":
            split_data = calculate_by_item_split(
                item_assignments=data.get("item_assignments", {}),
                items=data["items"],
                subtotal=float(data.get("subtotal", total)),
                tax=float(data.get("tax", 0)),
                tip=float(data.get("tip", 0)),
            )
        else:
            selected = data.get("split_members", member_ids)
            split_data = calculate_split(
                amount=total,
                member_ids=selected,
                split_type="equally",
            )

        # Generate unique share token for public summary link
        share_token = secrets.token_urlsafe(10)

        # Save receipt record
        receipt_doc = {
            "user_id":          user_id,
            "group_id":         group_id,
            "merchant":         merchant,
            "date":             date,
            "items":            data.get("items", []),
            "item_assignments": data.get("item_assignments", {}),
            "subtotal":         float(data.get("subtotal", total)),
            "tax":              float(data.get("tax", 0)),
            "tip":              float(data.get("tip", 0)),
            "total":            total,
            "split_type":       split_type,
            "per_person":       split_data,
            "share_token":      share_token,
            "expense_id":       None,       # filled after expense created
            "created_at":       datetime.utcnow(),
        }
        receipt_result = await db.receipts.insert_one(receipt_doc)
        receipt_id     = str(receipt_result.inserted_id)

        # Create expense
        expense_doc = {
            "desc":             merchant,
            "amount":           total,
            "paid_by_user_id":  data.get("paid_by_user_id", str(current_user["_id"])),
            "group_id":         group_id,
            "date":             date,
            "category":         "🍽️",
            "tags":             ["receipt"],
            "split_type":       split_type,
            "split_data":       split_data,
            "receipt_id":       receipt_id,
            "created_by":       user_id,
            "created_at":       datetime.utcnow(),
        }
        expense_result = await db.expenses.insert_one(expense_doc)
        expense_id     = str(expense_result.inserted_id)

        # Link receipt → expense
        await db.receipts.update_one(
            {"_id": receipt_result.inserted_id},
            {"$set": {"expense_id": expense_id}}
        )

        # Activity entry
        await db.activity.insert_one({
            "user_id":    user_id,
            "group_id":   group_id,
            "icon":       "🧾",
            "text":       f"{current_user['name']} added receipt \"{merchant}\" ₹{total:.0f}",
            "type":       "expense",
            "created_at": datetime.utcnow(),
        })

        # Notify group members
        for mid in member_ids:
            if mid != data["paid_by_user_id"]:
                await db.notifications.insert_one({
                    "user_id":    mid,
                    "icon":       "🧾",
                    "text":       f"Receipt \"{merchant}\" ₹{total:.0f} added in {group['name']}",
                    "type":       "expense",
                    "read":       False,
                    "created_at": datetime.utcnow(),
                })

        from core.config import settings
        return {
            "expense_id":  expense_id,
            "receipt_id":  receipt_id,
            "merchant":    merchant,
            "total":       total,
            "per_person":  split_data,
            "share_link":  f"{settings.FRONTEND_URL}/receipt/{share_token}",
            "message":     "Receipt expense created successfully"
        }

    except HTTPException:
        raise
    except KeyError as e:
        raise HTTPException(400, f"Missing required field: {str(e)}")
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Step 3: Public shareable summary link ─────────────────────
# No auth required — anyone with the link can view

@router.get("/summary/{share_token}")
async def get_receipt_summary(
    share_token: str,
    db=Depends(get_db)
):
    """
    PUBLIC endpoint — no auth needed.
    Anyone with the share link can view the receipt breakdown.
    Powers the "Copy Share Link" button after confirming receipt.
    """
    receipt = await db.receipts.find_one({"share_token": share_token})
    if not receipt:
        raise HTTPException(404, "Receipt not found or link has expired")

    # Get member names for per_person display
    per_person_named = {}
    for uid, amount in receipt.get("per_person", {}).items():
        try:
            user = await db.users.find_one({"_id": ObjectId(uid)})
            name = user["name"] if user else uid
        except Exception:
            name = uid
        per_person_named[name] = amount

    return {
        "merchant":        receipt["merchant"],
        "date":            receipt["date"],
        "items":           receipt.get("items", []),
        "subtotal":        receipt.get("subtotal", 0),
        "tax":             receipt.get("tax", 0),
        "tip":             receipt.get("tip", 0),
        "total":           receipt["total"],
        "split_type":      receipt.get("split_type", "equally"),
        "per_person":      per_person_named,
        "expense_id":      receipt.get("expense_id"),
    }