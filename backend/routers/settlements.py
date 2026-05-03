from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional

from core.database import get_db
from core.dependencies import get_current_user
from services.settlement_algo import minimize_debts, calculate_net_balances

router = APIRouter(prefix="/settlements", tags=["Settlements"])


@router.get("")
async def list_settlements(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db),
    status: Optional[str] = None
):
    """
    List settlements for current user.
    Shows who owes who across all groups.
    Query param 'status' can be 'pending' or 'settled' to filter.
    """
    user_id = str(current_user["_id"])

    query = {
        "$or": [
            {"from_user_id": user_id},
            {"to_user_id":   user_id}
        ]
    }
    
    if status:
        query["status"] = status

    settlements = await db.settlements.find(query).sort("created_at", -1).to_list(100)

    result = []
    for s in settlements:
        from_user = await db.users.find_one({"_id": ObjectId(s["from_user_id"])})
        to_user   = await db.users.find_one({"_id": ObjectId(s["to_user_id"])})
        group     = await db.groups.find_one({"_id": ObjectId(s["group_id"])}) if s.get("group_id") else None

        result.append({
            "id":             str(s["_id"]),
            "from_user_id":   s["from_user_id"],
            "from_user_name": from_user["name"] if from_user else "Unknown",
            "to_user_id":     s["to_user_id"],
            "to_user_name":   to_user["name"] if to_user else "Unknown",
            "amount":         s["amount"],
            "group_id":       s.get("group_id"),
            "group_name":     group["name"] if group else "",
            "status":         s.get("status", "pending"),
            "created_at":     s["created_at"],
            "settled_at":     s.get("settled_at"),
        })

    return result


@router.get("/smart")
async def get_smart_settlements(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Return an optimized settlement plan across ALL groups the user is in.
    Uses debt-minimization algorithm to reduce the number of transactions.
    """
    user_id = str(current_user["_id"])

    # Get all groups this user belongs to
    groups = await db.groups.find({"members.user_id": user_id}).to_list(100)

    all_transactions = []
    total_count = 0

    for group in groups:
        gid = str(group["_id"])
        member_ids = [m["user_id"] for m in group.get("members", [])]

        # Only process if there are at least 2 members
        if len(member_ids) < 2:
            continue

        expenses = await db.expenses.find({"group_id": gid}).to_list(500)

        # Calculate net balances using the algorithm
        net_balances = calculate_net_balances(expenses, member_ids)

        # Get optimized transactions
        transactions = minimize_debts(net_balances)

        # Attach user names
        for t in transactions:
            from_user = await db.users.find_one({"_id": ObjectId(t["from_user_id"])})
            to_user   = await db.users.find_one({"_id": ObjectId(t["to_user_id"])})
            all_transactions.append({
                "from_user_id":   t["from_user_id"],
                "from_user_name": from_user["name"] if from_user else "Unknown",
                "to_user_id":     t["to_user_id"],
                "to_user_name":   to_user["name"] if to_user else "Unknown",
                "amount":         t["amount"],
                "group_id":       gid,
                "group_name":     group.get("name", ""),
            })
            total_count += 1

    return {
        "optimized":          all_transactions,
        "total_transactions": total_count,
    }


@router.post("/apply-smart")
async def apply_smart_settlements(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Generate and save the optimized settlement plan as pending settlements.
    Replaces existing pending settlements.
    """
    user_id = str(current_user["_id"])

    # Get all groups this user belongs to
    groups = await db.groups.find({"members.user_id": user_id}).to_list(100)

    created_count = 0

    for group in groups:
        gid = str(group["_id"])
        member_ids = [m["user_id"] for m in group.get("members", [])]

        if len(member_ids) < 2:
            continue

        expenses = await db.expenses.find({"group_id": gid}).to_list(500)
        net_balances = calculate_net_balances(expenses, member_ids)
        transactions = minimize_debts(net_balances)

        # Remove existing pending settlements for this group
        await db.settlements.delete_many({"group_id": gid, "status": "pending"})

        # Insert new ones
        for t in transactions:
            if t["amount"] < 0.01:
                continue
            await db.settlements.insert_one({
                "from_user_id": t["from_user_id"],
                "to_user_id":   t["to_user_id"],
                "amount":       t["amount"],
                "group_id":     gid,
                "status":       "pending",
                "created_at":   datetime.now(timezone.utc),
                "settled_at":   None,
            })
            created_count += 1

    await db.activity.insert_one({
        "user_id":    user_id,
        "icon":       "✨",
        "text":       f"Smart settlement plan applied ({created_count} transactions)",
        "type":       "settle",
        "created_at": datetime.now(timezone.utc),
    })

    return {"message": f"Applied smart plan with {created_count} transactions", "count": created_count}


@router.post("/{settlement_id}/record")
async def record_settlement(
    settlement_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Mark a settlement as settled."""
    try:
        settlement = await db.settlements.find_one({"_id": ObjectId(settlement_id)})
    except Exception:
        raise HTTPException(400, "Invalid settlement ID")

    if not settlement:
        raise HTTPException(404, "Settlement not found")

    user_id = str(current_user["_id"])
    if (settlement["from_user_id"] != user_id and
            settlement["to_user_id"] != user_id):
        raise HTTPException(403, "Not your settlement")

    await db.settlements.update_one(
        {"_id": settlement["_id"]},
        {"$set": {
            "status":     "settled",
            "settled_at": datetime.now(timezone.utc)
        }}
    )

    await db.activity.insert_one({
        "user_id":    user_id,
        "icon":       "✅",
        "text":       f"Settlement of ₹{settlement['amount']:.0f} recorded",
        "type":       "settle",
        "created_at": datetime.now(timezone.utc),
    })

    other_id = (
        settlement["to_user_id"]
        if settlement["from_user_id"] == user_id
        else settlement["from_user_id"]
    )
    await db.notifications.insert_one({
        "user_id":    other_id,
        "icon":       "✅",
        "text":       f"{current_user['name']} settled ₹{settlement['amount']:.0f}",
        "type":       "settle",
        "read":       False,
        "created_at": datetime.now(timezone.utc),
    })

    return {"message": "Settlement recorded"}


# NOTE: /settled/clear must be defined BEFORE /{settlement_id} so FastAPI
# doesn't treat "settled" as a settlement_id.
@router.delete("/settled/clear")
async def clear_settled_transactions(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Delete ALL settled transactions for the current user."""
    user_id = str(current_user["_id"])

    result = await db.settlements.delete_many({
        "$or": [
            {"from_user_id": user_id},
            {"to_user_id":   user_id}
        ],
        "status": "settled"
    })

    return {
        "message": f"Cleared {result.deleted_count} settled transaction(s)",
        "count":   result.deleted_count
    }


@router.delete("/{settlement_id}")
async def delete_settlement(
    settlement_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Delete a single settlement from history."""
    try:
        settlement = await db.settlements.find_one({"_id": ObjectId(settlement_id)})
    except Exception:
        raise HTTPException(400, "Invalid settlement ID")

    if not settlement:
        raise HTTPException(404, "Settlement not found")

    user_id = str(current_user["_id"])
    if (settlement["from_user_id"] != user_id and
            settlement["to_user_id"] != user_id):
        raise HTTPException(403, "Not your settlement")

    await db.settlements.delete_one({"_id": settlement["_id"]})
    return {"message": "Settlement deleted successfully"}


@router.post("/remind/{user_id}")
async def send_reminder(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Send a payment reminder notification to a user."""
    target = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target:
        raise HTTPException(404, "User not found")

    await db.notifications.insert_one({
        "user_id":    user_id,
        "icon":       "🔔",
        "text":       f"{current_user['name']} sent you a payment reminder",
        "type":       "reminder",
        "read":       False,
        "created_at": datetime.now(timezone.utc),
    })

    await db.activity.insert_one({
        "user_id":    str(current_user["_id"]),
        "icon":       "🔔",
        "text":       f"Reminder sent to {target['name']}",
        "type":       "reminder",
        "created_at": datetime.now(timezone.utc),
    })

    return {"message": f"Reminder sent to {target['name']}"}