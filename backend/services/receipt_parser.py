import json
import re
from groq import Groq
from core.config import settings


def _clean_json(raw: str) -> str:
    """Strip markdown code fences if Groq wraps response in ```json ... ```"""
    raw = raw.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


async def parse_receipt_text(raw_text: str) -> dict:
    """
    Send raw OCR text to Groq.
    Groq is smart enough to understand any bill format —
    restaurant, grocery, hotel, anything.
    Returns structured JSON with items, tax, tip, total.
    """

    if not raw_text or len(raw_text.strip()) < 10:
        raise ValueError("Receipt text is too short or empty. Try a clearer image.")

    client = Groq(api_key=settings.GROQ_API_KEY)

    system_prompt = """You are a receipt parsing assistant.
Extract all information from the receipt text provided.
Return ONLY valid JSON — no explanation, no markdown, no extra text.

The JSON must follow this exact structure:
{
  "merchant": "store or restaurant name or Unknown",
  "date": "YYYY-MM-DD or empty string if not found",
  "items": [
    {"id": "1", "name": "item name", "amount": 0.00},
    {"id": "2", "name": "item name", "amount": 0.00}
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "tip": 0.00,
  "total": 0.00
}

Rules:
- Every item must have id (string number), name, and amount (float)
- If you cannot find tax, tip, or date, use 0.0 or empty string
- amounts must be numbers not strings
- If total is not found, sum up all items
- Do not include currency symbols in amounts"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": f"Parse this receipt:\n\n{raw_text}"}
            ],
            temperature=0.1,    # low temperature = more consistent output
            max_tokens=1000,
        )

        raw_response = response.choices[0].message.content
        cleaned     = _clean_json(raw_response)
        parsed      = json.loads(cleaned)

        # Validate required fields exist
        if "items" not in parsed:
            parsed["items"] = []
        if "subtotal" not in parsed:
            parsed["subtotal"] = sum(
                item.get("amount", 0) for item in parsed["items"]
            )
        if "tax" not in parsed:
            parsed["tax"] = 0.0
        if "tip" not in parsed:
            parsed["tip"] = 0.0
        if "total" not in parsed:
            parsed["total"] = parsed["subtotal"] + parsed["tax"] + parsed["tip"]
        if "merchant" not in parsed:
            parsed["merchant"] = "Unknown"
        if "date" not in parsed:
            parsed["date"] = ""

        # Ensure all item IDs are strings
        for i, item in enumerate(parsed["items"]):
            item["id"] = str(item.get("id", i + 1))
            item["amount"] = float(item.get("amount", 0))

        parsed["raw_text"] = raw_text
        return parsed

    except json.JSONDecodeError:
        # Groq returned something unparseable — fallback to basic parse
        return _fallback_parse(raw_text)

    except Exception as e:
        raise ValueError(f"Groq parsing failed: {str(e)}")


def _fallback_parse(text: str) -> dict:
    """
    Last resort — basic line-by-line parse if Groq fails.
    Better than nothing.
    """
    import re
    lines  = text.split("\n")
    items  = []
    subtotal = 0.0

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        match = re.search(r"(\d+\.?\d{0,2})\s*$", line)
        if match:
            try:
                amount = float(match.group(1))
                name   = line[:match.start()].strip()
                if len(name) > 2 and amount > 0:
                    items.append({
                        "id": str(i),
                        "name": name,
                        "amount": round(amount, 2)
                    })
                    subtotal += amount
            except ValueError:
                continue

    subtotal = round(subtotal, 2)
    return {
        "merchant": "Unknown",
        "date": "",
        "items": items,
        "subtotal": subtotal,
        "tax": 0.0,
        "tip": 0.0,
        "total": subtotal,
        "raw_text": text
    }