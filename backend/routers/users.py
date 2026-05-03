from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from core.database import get_db
from core.dependencies import get_current_user
from models.user import (
    UserResponse, UpdateUserRequest,
    UpdatePreferencesRequest, StatsResponse
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse.from_mongo(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: UpdateUserRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(400, "No fields to update")

    # If changing email check it's not taken
    if "email" in updates and updates["email"] != current_user["email"]:
        existing = await db.users.find_one({"email": updates["email"]})
        if existing:
            raise HTTPException(400, "Email already in use")

    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": updates}
    )
    updated = await db.users.find_one({"_id": current_user["_id"]})
    return UserResponse.from_mongo(updated)


@router.get("/me/stats", response_model=StatsResponse)
async def get_stats(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = str(current_user["_id"])

    # How many groups user is in
    groups_count = await db.groups.count_documents({
        "members.user_id": user_id
    })

    # Total amount user has paid across all expenses
    pipeline = [
        {"$match": {"paid_by_user_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    result = await db.expenses.aggregate(pipeline).to_list(1)
    total_split = result[0]["total"] if result else 0.0

    # How many settlements user has been part of
    settlements_count = await db.settlements.count_documents({
        "$or": [
            {"from_user_id": user_id},
            {"to_user_id": user_id}
        ],
        "status": "settled"
    })

    return StatsResponse(
        groups_count=groups_count,
        total_split=total_split,
        settlements_count=settlements_count,
    )


@router.patch("/me/preferences")
async def update_preferences(
    body: UpdatePreferencesRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(400, "No preferences to update")

    # Use dot notation to update nested preferences fields
    prefixed = {f"preferences.{k}": v for k, v in updates.items()}
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": prefixed}
    )
    updated = await db.users.find_one({"_id": current_user["_id"]})
    return {"preferences": updated.get("preferences", {})}


@router.post("/me/onboarding-complete")
async def complete_onboarding(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"onboarding_done": True}}
    )
    return {"message": "Onboarding marked complete"}


@router.delete("/me")
async def delete_account(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = str(current_user["_id"])

    # Delete everything related to this user
    await db.users.delete_one({"_id": current_user["_id"]})
    await db.expenses.delete_many({"paid_by_user_id": user_id})
    await db.settlements.delete_many({
        "$or": [
            {"from_user_id": user_id},
            {"to_user_id": user_id}
        ]
    })
    await db.notifications.delete_many({"user_id": user_id})
    await db.activity.delete_many({"user_id": user_id})

    # Remove from all groups
    await db.groups.update_many(
        {"members.user_id": user_id},
        {"$pull": {"members": {"user_id": user_id}}}
    )

    return {"message": "Account deleted permanently"}
