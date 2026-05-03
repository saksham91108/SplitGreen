from typing import Dict, List


def calculate_split(
    amount: float,
    member_ids: List[str],
    split_type: str,
    split_data: Dict[str, float] | None = None,
) -> Dict[str, float]:
    """
    Calculate how much each person owes.

    split_type options:
      equally   → divide equally among all members
      percentage → each person pays their percentage
      exact     → each person pays exact amount specified
      shares    → divide by number of shares per person
      by_item   → already calculated, just pass through
    """

    if not member_ids:
        return {}

    if split_type == "equally":
        share = round(amount / len(member_ids), 2)
        result = {uid: share for uid in member_ids}
        # Fix rounding difference — add to first person
        diff = round(amount - sum(result.values()), 2)
        if diff != 0:
            result[member_ids[0]] = round(result[member_ids[0]] + diff, 2)
        return result

    elif split_type == "percentage":
        if not split_data:
            raise ValueError("split_data required for percentage split")
        total_pct = sum(split_data.values())
        if abs(total_pct - 100) > 0.01:
            raise ValueError(f"Percentages must sum to 100, got {total_pct}")
        return {
            uid: round(amount * (pct / 100), 2)
            for uid, pct in split_data.items()
        }

    elif split_type == "exact":
        if not split_data:
            raise ValueError("split_data required for exact split")
        total_exact = sum(split_data.values())
        if abs(total_exact - amount) > 0.01:
            raise ValueError(
                f"Exact amounts must sum to {amount}, got {total_exact}"
            )
        return {uid: round(val, 2) for uid, val in split_data.items()}

    elif split_type == "shares":
        if not split_data:
            raise ValueError("split_data required for shares split")
        total_shares = sum(split_data.values())
        if total_shares <= 0:
            raise ValueError("Total shares must be greater than 0")
        return {
            uid: round(amount * (shares / total_shares), 2)
            for uid, shares in split_data.items()
        }

    elif split_type == "by_item":
        if not split_data:
            raise ValueError("split_data required for by_item split")
        return {uid: round(val, 2) for uid, val in split_data.items()}

    else:
        raise ValueError(f"Unknown split_type: {split_type}")


def calculate_by_item_split(
    item_assignments: Dict[str, List[str]],
    items: List[Dict],
    subtotal: float,
    tax: float,
    tip: float,
) -> Dict[str, float]:
    """
    For receipt scanning — splits items between people
    and distributes tax/tip proportionally.

    item_assignments = { item_id: [user_id, user_id, ...] }
    items = [ { id, name, amount } ]
    """
    item_map = {item["id"]: item["amount"] for item in items}
    person_subtotals: Dict[str, float] = {}

    for item_id, user_ids in item_assignments.items():
        if not user_ids:
            continue
        item_amount = item_map.get(item_id, 0)
        share = item_amount / len(user_ids)
        for uid in user_ids:
            person_subtotals[uid] = person_subtotals.get(uid, 0) + share

    result = {}
    for uid, person_sub in person_subtotals.items():
        proportion = person_sub / subtotal if subtotal > 0 else 0
        result[uid] = round(
            person_sub + (tax * proportion) + (tip * proportion), 2
        )

    return result