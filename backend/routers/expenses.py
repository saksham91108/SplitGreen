from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from datetime import datetime

from core.database import get_db
from core.dependencies import get_current_user
from models.expense import (
    CreateExpenseRequest, ExpenseResponse,
    SharePreviewResponse
)
from services.split_calc import calculate_split

router = APIRouter(prefix="/expenses", tags=["Expenses"])


async def _resolve_names(expense: dict, db):
    paid_by_name = ""
    group_name = ""
    try:
        user = await db.users.find_one(
            {"_id": ObjectId(expense["paid_by_user_id"])}
        )
        if user:
            paid_by_name = user["name"]
    except Exception:
        pass
    try:
        group = await db.groups.find_one(
            {"_id": ObjectId(expense["group_id"])}
        )
        if group:
            group_name = group["name"]
    except Exception:
        pass
    return paid_by_name, group_name


@router.get("")
async def list_expenses(
    group_id:  str | None = Query(None),
    search:    str | None = Query(None),
    category:  str | None = Query(None),
    date_from: str | None = Query(None),
    date_to:   str | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = str(current_user["_id"])

    user_groups = await db.groups.find(
        {"members.user_id": user_id}, {"_id": 1}
    ).to_list(100)
    group_ids = [str(g["_id"]) for g in user_groups]

    query: dict = {"group_id": {"$in": group_ids}}

    if group_id:
        query["group_id"] = group_id
    if search:
        query["desc"] = {"$regex": search, "$options": "i"}
    if category and category != "All":
        query["tags"] = {"$in": [category.lower()]}
    if date_from:
        query.setdefault("date", {})["$gte"] = date_from
    if date_to:
        query.setdefault("date", {})["$lte"] = date_to

    expenses = await db.expenses.find(query).sort(
        "date", -1
    ).to_list(200)

    result = []
    for exp in expenses:
        paid_by_name, group_name = await _resolve_names(exp, db)
        your_share = exp.get("split_data", {}).get(user_id, 0)
        result.append(ExpenseResponse.from_mongo(
            exp,
            your_share=your_share,
            paid_by_name=paid_by_name,
            group_name=group_name
        ))
    return result


@router.post("", status_code=201)
async def create_expense(
    body: CreateExpenseRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = str(current_user["_id"])

    group = await db.groups.find_one(
        {"_id": ObjectId(body.group_id)}
    )
    if not group:
        raise HTTPException(404, "Group not found")

    member_ids = [m["user_id"] for m in group.get("members", [])]
    if user_id not in member_ids:
        raise HTTPException(403, "You are not in this group")

    try:
        split_data = calculate_split(
            amount=body.amount,
            member_ids=member_ids,
            split_type=body.split_type,
            split_data=body.split_data,
        )
    except ValueError as e:
        raise HTTPException(400, str(e))

    doc = {
        "desc": body.desc,
        "amount": body.amount,
        "paid_by_user_id": body.paid_by_user_id,
        "group_id": body.group_id,
        "date": body.date,
        "category": body.category,
        "tags": body.tags,
        "split_type": body.split_type,
        "split_data": split_data,
        "receipt_id": None,
        "created_by": user_id,
        "created_at": datetime.utcnow(),
    }
    result = await db.expenses.insert_one(doc)
    created = await db.expenses.find_one({"_id": result.inserted_id})

    # Activity
    await db.activity.insert_one({
        "user_id": user_id,
        "group_id": body.group_id,
        "icon": body.category,
        "text": (
            f"{current_user['name']} added "
            f"\"{body.desc}\" ₹{body.amount:.0f}"
        ),
        "type": "expense",
        "created_at": datetime.utcnow(),
    })

    # Notify other group members
    for mid in member_ids:
        if mid != body.paid_by_user_id:
            await db.notifications.insert_one({
                "user_id": mid,
                "icon": "💳",
                "text": (
                    f"New expense \"{body.desc}\" "
                    f"₹{body.amount:.0f} in {group['name']}"
                ),
                "type": "expense",
                "read": False,
                "created_at": datetime.utcnow(),
            })

    paid_by_name, group_name = await _resolve_names(created, db)
    return ExpenseResponse.from_mongo(
        created,
        your_share=split_data.get(user_id, 0),
        paid_by_name=paid_by_name,
        group_name=group_name
    )


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        exp = await db.expenses.find_one(
            {"_id": ObjectId(expense_id)}
        )
    except Exception:
        raise HTTPException(400, "Invalid expense ID")

    if not exp:
        raise HTTPException(404, "Expense not found")
    if exp["created_by"] != str(current_user["_id"]):
        raise HTTPException(403, "Only the creator can delete this")

    await db.expenses.delete_one({"_id": exp["_id"]})
    return {"message": "Expense deleted"}


@router.get("/share-preview", response_model=SharePreviewResponse)
async def share_preview(
    amount:     float = Query(..., gt=0),
    group_id:   str   = Query(...),
    split_type: str   = Query("equally"),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(404, "Group not found")

    member_ids = [m["user_id"] for m in group.get("members", [])]
    try:
        per_person = calculate_split(amount, member_ids, split_type)
    except ValueError as e:
        raise HTTPException(400, str(e))

    return SharePreviewResponse(per_person=per_person, total=amount)
