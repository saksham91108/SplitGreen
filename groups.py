from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timedelta, timezone
import secrets

from core.database import get_db
from core.dependencies import get_current_user
from core.config import settings
from models.group import (
    CreateGroupRequest, UpdateGroupRequest,
    AddMemberRequest, GroupResponse, BalanceEntry
)

router = APIRouter(prefix="/groups", tags=["Groups"])


def _member_ids(group: dict) -> list[str]:
    return [m["user_id"] for m in group.get("members", [])]


async def _group_or_404(group_id: str, db) -> dict:
    try:
        group = await db.groups.find_one({"_id": ObjectId(group_id)})
    except Exception:
        raise HTTPException(400, "Invalid group ID")
    if not group:
        raise HTTPException(404, "Group not found")
    return group


async def _assert_member(group: dict, user_id: str):
    if user_id not in _member_ids(group):
        raise HTTPException(403, "You are not a member of this group")


async def _assert_admin(group: dict, user_id: str):
    for m in group.get("members", []):
        if m["user_id"] == user_id and m.get("role") == "admin":
            return
    raise HTTPException(403, "Only group admin can do this")


@router.get("")
async def list_groups(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = str(current_user["_id"])
    groups = await db.groups.find(
        {"members.user_id": user_id}
    ).to_list(100)

    result = []
    for g in groups:
        gid = str(g["_id"])
        exp_count = await db.expenses.count_documents(
            {"group_id": gid}
        )

        # Calculate net balance for current user in this group
        paid_pipeline = [
            {"$match": {
                "group_id": gid,
                "paid_by_user_id": user_id
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        paid_result = await db.expenses.aggregate(
            paid_pipeline
        ).to_list(1)
        total_paid = paid_result[0]["total"] if paid_result else 0

        all_expenses = await db.expenses.find(
            {"group_id": gid}
        ).to_list(500)
        total_share = sum(
            exp.get("split_data", {}).get(user_id, 0)
            for exp in all_expenses
        )

        balance = round(total_paid - total_share, 2)
        result.append(
            GroupResponse.from_mongo(
                g, balance=balance,
                expenses_count=exp_count
            )
        )

    return result


@router.post("", status_code=201)
async def create_group(
    body: CreateGroupRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = str(current_user["_id"])
    doc = {
        "name": body.name,
        "default_split": body.default_split,
        "members": [{
            "user_id": user_id,
            "name": current_user["name"],
            "role": "admin",
            "joined_at": datetime.now(timezone.utc),
        }],
        "invite_code": None,
        "invite_expires_at": None,
        "created_by": user_id,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.groups.insert_one(doc)
    created = await db.groups.find_one({"_id": result.inserted_id})

    # Write to activity feed
    await db.activity.insert_one({
        "user_id": user_id,
        "group_id": str(result.inserted_id),
        "icon": "👥",
        "text": f"You created group \"{body.name}\"",
        "type": "group",
        "created_at": datetime.now(timezone.utc),
    })

    return GroupResponse.from_mongo(created)


@router.get("/{group_id}")
async def get_group(
    group_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    group = await _group_or_404(group_id, db)
    await _assert_member(group, str(current_user["_id"]))
    exp_count = await db.expenses.count_documents(
        {"group_id": group_id}
    )
    return GroupResponse.from_mongo(group, expenses_count=exp_count)


@router.patch("/{group_id}")
async def update_group(
    group_id: str,
    body: UpdateGroupRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    group = await _group_or_404(group_id, db)
    await _assert_admin(group, str(current_user["_id"]))

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(400, "Nothing to update")

    await db.groups.update_one(
        {"_id": group["_id"]},
        {"$set": updates}
    )
    updated = await db.groups.find_one({"_id": group["_id"]})
    return GroupResponse.from_mongo(updated)


@router.delete("/{group_id}")
async def delete_group(
    group_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Delete a group (admin only). This also deletes all expenses and settlements in the group."""
    group = await _group_or_404(group_id, db)
    await _assert_admin(group, str(current_user["_id"]))

    # Delete all expenses in this group
    await db.expenses.delete_many({"group_id": group_id})
    
    # Delete all settlements for this group
    await db.settlements.delete_many({"group_id": group_id})
    
    # Delete all activities related to this group
    await db.activity.delete_many({"group_id": group_id})
    
    # Delete the group itself
    await db.groups.delete_one({"_id": group["_id"]})
    
    return {"message": f"Group '{group['name']}' and all its data deleted successfully"}


@router.post("/{group_id}/members")
async def add_member(
    group_id: str,
    body: AddMemberRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    group = await _group_or_404(group_id, db)
    await _assert_member(group, str(current_user["_id"]))

    if body.email:
        target = await db.users.find_one({"email": body.email})
    elif body.user_id:
        target = await db.users.find_one(
            {"_id": ObjectId(body.user_id)}
        )
    else:
        raise HTTPException(400, "Provide email or user_id")

    if not target:
        raise HTTPException(404, "User not found")

    target_id = str(target["_id"])
    if target_id in _member_ids(group):
        raise HTTPException(400, "User already in this group")

    await db.groups.update_one(
        {"_id": group["_id"]},
        {"$push": {"members": {
            "user_id": target_id,
            "name": target["name"],
            "role": "member",
            "joined_at": datetime.now(timezone.utc),
        }}}
    )

    # Notify the added user
    await db.notifications.insert_one({
        "user_id": target_id,
        "icon": "👥",
        "text": f"You were added to \"{group['name']}\"",
        "type": "group",
        "read": False,
        "created_at": datetime.now(timezone.utc),
    })

    return {"message": f"{target['name']} added to group"}


@router.delete("/{group_id}/members/{user_id}")
async def remove_member(
    group_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    group = await _group_or_404(group_id, db)
    await _assert_admin(group, str(current_user["_id"]))

    if user_id not in _member_ids(group):
        raise HTTPException(404, "User not in group")

    await db.groups.update_one(
        {"_id": group["_id"]},
        {"$pull": {"members": {"user_id": user_id}}}
    )
    return {"message": "Member removed"}


@router.delete("/{group_id}/leave")
async def leave_group(
    group_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    group = await _group_or_404(group_id, db)
    user_id = str(current_user["_id"])
    await _assert_member(group, user_id)

    await db.groups.update_one(
        {"_id": group["_id"]},
        {"$pull": {"members": {"user_id": user_id}}}
    )
    return {"message": "You left the group"}


@router.get("/{group_id}/invite-link")
async def get_invite_link(
    group_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    group = await _group_or_404(group_id, db)
    await _assert_member(group, str(current_user["_id"]))

    code = secrets.token_urlsafe(8)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    await db.groups.update_one(
        {"_id": group["_id"]},
        {"$set": {
            "invite_code": code,
            "invite_expires_at": expires_at
        }}
    )

    invite_link = f"{settings.FRONTEND_URL}/join/{code}"
    return {
        "invite_link": invite_link,
        "expires_at": expires_at,
        "code": code
    }


@router.post("/join/{invite_code}")
async def join_group(
    invite_code: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    group = await db.groups.find_one({"invite_code": invite_code})
    if not group:
        raise HTTPException(404, "Invalid or expired invite link")

    if (group.get("invite_expires_at") and
            group["invite_expires_at"] < datetime.now(timezone.utc)):
        raise HTTPException(400, "Invite link has expired")

    user_id = str(current_user["_id"])
    if user_id in _member_ids(group):
        raise HTTPException(400, "You are already in this group")

    await db.groups.update_one(
        {"_id": group["_id"]},
        {"$push": {"members": {
            "user_id": user_id,
            "name": current_user["name"],
            "role": "member",
            "joined_at": datetime.now(timezone.utc),
        }}}
    )

    await db.activity.insert_one({
        "user_id": user_id,
        "group_id": str(group["_id"]),
        "icon": "👥",
        "text": f"{current_user['name']} joined \"{group['name']}\"",
        "type": "group",
        "created_at": datetime.now(timezone.utc),
    })

    return {
        "message": f"Joined {group['name']}",
        "group_id": str(group["_id"])
    }


@router.get("/{group_id}/balances")
async def get_group_balances(
    group_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get balances for all members in the group.
    Returns who owes whom from the perspective of the current user.
    """
    group = await _group_or_404(group_id, db)
    user_id = str(current_user["_id"])
    await _assert_member(group, user_id)

    # Get all expenses for this group
    expenses = await db.expenses.find(
        {"group_id": group_id}
    ).to_list(500)

    # Initialize balance tracking for each member
    # positive balance = member is owed money (paid more than their share)
    # negative balance = member owes money (paid less than their share)
    member_balances = {}
    for m in group.get("members", []):
        member_balances[m["user_id"]] = 0.0

    # Calculate net balance for each member
    for exp in expenses:
        payer_id = exp["paid_by_user_id"]
        amount = exp["amount"]
        split_data = exp.get("split_data", {})
        
        # Payer gets credit for the amount they paid
        if payer_id in member_balances:
            member_balances[payer_id] += amount
        
        # Everyone gets debited for their share
        for uid, share in split_data.items():
            if uid in member_balances:
                member_balances[uid] -= share

    # Use the debt-minimization algorithm for pairwise amounts
    # This avoids the double-counting bug from subtracting net balances directly.
    from services.settlement_algo import minimize_debts

    optimized = minimize_debts(member_balances)

    # Aggregate pairwise amounts from current user's perspective
    owes_you_map: dict[str, float] = {}
    you_owe_map:  dict[str, float] = {}

    for t in optimized:
        # t["from_user_id"] pays t["to_user_id"] t["amount"]
        if t["to_user_id"] == user_id:
            # Someone owes the current user
            owes_you_map[t["from_user_id"]] = (
                owes_you_map.get(t["from_user_id"], 0) + t["amount"]
            )
        elif t["from_user_id"] == user_id:
            # Current user owes someone
            you_owe_map[t["to_user_id"]] = (
                you_owe_map.get(t["to_user_id"], 0) + t["amount"]
            )

    result = []
    for m in group.get("members", []):
        mid = m["user_id"]
        if mid == user_id:
            continue

        owed   = round(owes_you_map.get(mid, 0.0), 2)
        i_owe  = round(you_owe_map.get(mid, 0.0), 2)

        result.append(BalanceEntry(
            user_id=mid,
            name=m["name"],
            owes_you=owed,
            you_owe=i_owe,
            net=round(owed - i_owe, 2),
        ))

    return result