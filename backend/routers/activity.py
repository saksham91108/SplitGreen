from fastapi import APIRouter, Depends, Query, HTTPException
from bson import ObjectId
from datetime import datetime

from core.database import get_db
from core.dependencies import get_current_user

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.get("")
async def get_activity(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Global activity feed for current user.
    Powers Recent Activity card in Overview tab.
    """
    user_id = str(current_user["_id"])

    # Get user's group IDs
    user_groups = await db.groups.find(
        {"members.user_id": user_id}, {"_id": 1}
    ).to_list(100)
    group_ids = [str(g["_id"]) for g in user_groups]

    # Get activity for user OR any of their groups
    activities = await db.activity.find({
        "$or": [
            {"user_id":  user_id},
            {"group_id": {"$in": group_ids}}
        ]
    }).sort("created_at", -1).limit(limit).to_list(limit)

    result = []
    for a in activities:
        # Format time as "2h ago", "1d ago" etc
        created = a.get("created_at", datetime.utcnow())
        diff    = datetime.utcnow() - created
        if diff.days > 0:
            time_str = f"{diff.days}d ago"
        elif diff.seconds > 3600:
            time_str = f"{diff.seconds // 3600}h ago"
        elif diff.seconds > 60:
            time_str = f"{diff.seconds // 60}m ago"
        else:
            time_str = "just now"

        result.append({
            "id":       str(a["_id"]),
            "icon":     a.get("icon", "📋"),
            "text":     a.get("text", ""),
            "time":     time_str,
            "type":     a.get("type", "expense"),
        })

    return result


@router.get("/groups/{group_id}")
async def get_group_activity(
    group_id: str,
    limit: int = Query(default=20, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Activity feed for a specific group.
    Powers GroupDetail → Activity tab.
    """
    user_id = str(current_user["_id"])

    # Verify user is in group
    try:
        group = await db.groups.find_one({"_id": ObjectId(group_id)})
    except Exception:
        raise HTTPException(400, "Invalid group ID")

    if not group:
        raise HTTPException(404, "Group not found")

    member_ids = [m["user_id"] for m in group.get("members", [])]
    if user_id not in member_ids:
        raise HTTPException(403, "You are not in this group")

    activities = await db.activity.find(
        {"group_id": group_id}
    ).sort("created_at", -1).limit(limit).to_list(limit)

    result = []
    for a in activities:
        created  = a.get("created_at", datetime.utcnow())
        diff     = datetime.utcnow() - created
        if diff.days > 0:
            time_str = f"{diff.days}d ago"
        elif diff.seconds > 3600:
            time_str = f"{diff.seconds // 3600}h ago"
        elif diff.seconds > 60:
            time_str = f"{diff.seconds // 60}m ago"
        else:
            time_str = "just now"

        result.append({
            "id":   str(a["_id"]),
            "icon": a.get("icon", "📋"),
            "text": a.get("text", ""),
            "time": time_str,
            "type": a.get("type", "expense"),
        })

    return result