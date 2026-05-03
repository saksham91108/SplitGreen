from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime

from core.database import get_db
from core.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get all notifications for current user. Powers bell dropdown in Navbar."""
    user_id = str(current_user["_id"])

    notifications = await db.notifications.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(50)

    result = []
    for n in notifications:
        created  = n.get("created_at", datetime.utcnow())
        diff     = datetime.utcnow() - created
        if diff.days > 0:
            time_str = f"{diff.days}d"
        elif diff.seconds > 3600:
            time_str = f"{diff.seconds // 3600}h"
        elif diff.seconds > 60:
            time_str = f"{diff.seconds // 60}m"
        else:
            time_str = "now"

        result.append({
            "id":   str(n["_id"]),
            "icon": n.get("icon", "🔔"),
            "text": n.get("text", ""),
            "time": time_str,
            "type": n.get("type", "info"),
            "read": n.get("read", False),
        })

    return result


# IMPORTANT: /read-all must be declared BEFORE /{notification_id}/read
# otherwise FastAPI will match "read-all" as notification_id.
@router.patch("/read-all")
async def mark_all_read(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Mark all notifications as read."""
    user_id = str(current_user["_id"])

    result = await db.notifications.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}}
    )

    return {
        "message": f"Marked {result.modified_count} notifications as read"
    }


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Mark a single notification as read."""
    try:
        notif = await db.notifications.find_one(
            {"_id": ObjectId(notification_id)}
        )
    except Exception:
        raise HTTPException(400, "Invalid notification ID")

    if not notif:
        raise HTTPException(404, "Notification not found")

    if notif["user_id"] != str(current_user["_id"]):
        raise HTTPException(403, "Not your notification")

    await db.notifications.update_one(
        {"_id": notif["_id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}
