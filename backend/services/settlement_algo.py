from typing import Dict, List


def minimize_debts(net_balances: Dict[str, float]) -> List[Dict]:
    """
    Debt minimization algorithm.
    
    Takes net balance per user:
      positive = others owe them money
      negative = they owe others money
    
    Returns minimum list of transactions to clear all debts.
    
    Example:
      A paid for everyone → A: +600
      B owes             → B: -200  
      C owes             → C: -400
      Result: B pays A 200, C pays A 400
    """
    # Separate into who is owed money and who owes money
    creditors = []  # people who should receive money
    debtors   = []  # people who need to pay

    for uid, amount in net_balances.items():
        if amount > 0.01:       # they are owed money
            creditors.append([amount, uid])
        elif amount < -0.01:    # they owe money
            debtors.append([-amount, uid])  # store as positive

    # Sort both lists largest first
    creditors.sort(reverse=True)
    debtors.sort(reverse=True)

    transactions = []

    i, j = 0, 0
    while i < len(creditors) and j < len(debtors):
        credit_amt, creditor = creditors[i]
        debt_amt,   debtor   = debtors[j]

        # How much can be settled right now
        pay = min(credit_amt, debt_amt)
        pay = round(pay, 2)

        transactions.append({
            "from_user_id": debtor,
            "to_user_id":   creditor,
            "amount":       pay,
        })

        # Reduce balances
        creditors[i][0] = round(credit_amt - pay, 2)
        debtors[j][0]   = round(debt_amt   - pay, 2)

        # Move pointer if fully settled
        if creditors[i][0] < 0.01:
            i += 1
        if debtors[j][0] < 0.01:
            j += 1

    return transactions


def calculate_net_balances(
    expenses: List[Dict],
    member_ids: List[str]
) -> Dict[str, float]:
    """
    Calculate net balance for each member across all expenses.
    
    For each expense:
      - Person who paid gets credited the full amount
      - Each person gets debited their share
    
    Net = total paid - total owed
      positive = others owe you
      negative = you owe others
    """
    balances = {uid: 0.0 for uid in member_ids}

    for exp in expenses:
        payer = exp.get("paid_by_user_id")
        amount = exp.get("amount", 0)
        split_data = exp.get("split_data", {})

        # Payer gets credited
        if payer in balances:
            balances[payer] = round(balances[payer] + amount, 2)

        # Everyone gets debited their share
        for uid, share in split_data.items():
            if uid in balances:
                balances[uid] = round(balances[uid] - share, 2)

    return balances