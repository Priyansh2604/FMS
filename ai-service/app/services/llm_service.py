import json
import logging
import time

import httpx

from app.config import settings
from app.schemas.expense import ExpenseExtraction, LineItem, VALID_CATEGORIES

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert expense extraction engine for AURA Finance (Indian fintech app).

Your job: extract EVERY piece of financial information from OCR text of receipts, invoices, bills, and payment screenshots.

RULES:
1. NEVER invent or guess values. If a field is not present, return null.
2. The `amount` field MUST be the FINAL total / grand total / amount paid — never a subtotal.
3. For Indian receipts: extract GST breakdown (CGST+SGST or IGST), HSN codes, GSTIN.
4. For line items: extract EVERY item with name, qty, unit price, total.
5. Detect payment method from keywords: UPI, credit card, debit card, net banking, cash, wallet.
6. If card last 4 digits are visible, extract them.
7. If UPI ID is visible, extract it.
8. Extract store/shop address and phone if present.
9. Extract tip, discount, service charge if present.
10. Category must be EXACTLY one of the allowed categories below.
11. Return ONLY valid JSON. No markdown, no explanation, no preamble.

ALLOWED CATEGORIES (pick the closest match):
{categories}

CATEGORY SELECTION GUIDE:
- Restaurant/cafe/food delivery/swiggy/zomato → "Food & Dining"
- Supermarket/vegetables/groceries/bigbasket/blinkit → "Groceries"
- Petrol/diesel/fuel/parking/toll → "Fuel & Parking"
- Taxi/ola/uber/auto/bus/train/metro → "Transport"
- Amazon/flipkart/clothes/shopping → "Shopping"
- Movie/theatre/game → "Entertainment"
- Mobile recharge/broadband/dth → "Bills & Recharge"
- Electricity/water/gas/maintenance → "Utilities"
- Hospital/medicine/pharmacy/doctor → "Healthcare"
- College/school/course/book → "Education"
- Hotel/flight/train ticket/irctc → "Travel"
- House rent → "Rent"
- Health/car/life insurance → "Insurance"
- Netflix/spotify/prime → "Subscriptions"
- Salon/barber/parlour/beauty → "Personal Care"
- Furniture/home decor/appliance → "Home & Kitchen"
- Phone/laptop/headphone/electronics → "Electronics"
- Gift/donation/charity → "Gifts & Donations"
- Lawyer/CA/consultant → "Professional Services"
- Vet/pet food/pet shop → "Pets"
- Baby/diaper/toy/kids → "Kids & Baby"
- Gym/yoga/sports → "Sports & Fitness"
- Income tax/GST/stamp duty/penalty → "Taxes & Fees"
- Salary/paycheck → "Salary"
- Mutual fund/SIP/stock → "Investment"
- Anything else → "Other"
"""

USER_PROMPT_TEMPLATE = """Extract ALL financial data from this receipt/invoice text:

---
{ocr_text}
---

Return a JSON object with these fields (use null for missing values):
{{
  "merchant": "string — store/brand/vendor name, cleaned up",
  "amount": number — GRAND TOTAL / final amount paid (NOT subtotal),
  "currency": "string — INR/USD/EUR etc",
  "category": "one of the allowed categories — pick the CLOSEST match, even if imperfect",
  "subcategory": "string — ALWAYS provide a specific subcategory. Examples: 'Lunch at Cafe', 'Bike Repair', 'Pet Grooming', 'Gym Monthly', 'Cloud Hosting'. Even if category matches well, give a descriptive subcategory.",
  "description": "string — brief 1-line summary of what was purchased",
  "expense_date": "YYYY-MM-DD format",
  "payment_method": "string — UPI/Credit Card/Debit Card/Cash/Wallet/Net Banking",
  "confidence": number 0.0-1.0 — how confident you are in the extraction,

  "gst_amount": number — total GST/tax if present,
  "gst_percent": number — GST rate (e.g. 5, 12, 18, 28),
  "cgst": number — CGST amount if split,
  "sgst": number — SGST amount if split,
  "igst": number — IGST amount if inter-state,
  "subtotal": number — amount before tax,
  "tax_rate": number — effective tax rate percentage,

  "tip_amount": number — tip/gratuity if present,
  "discount_amount": number — discount/scheme amount if present,
  "total_items": number — count of distinct items purchased,

  "invoice_number": "string — invoice/bill/receipt number",
  "vendor_gstin": "string — 15-digit GSTIN",
  "receipt_number": "string — receipt/transaction reference number",

  "payment_method_detail": "string — e.g. 'HDFC Credit Card', 'Google Pay UPI'",
  "card_last_four": "string — last 4 digits of card if visible",
  "upi_id": "string — UPI ID if visible (e.g. user@upi)",

  "store_address": "string — store/shop address if visible",
  "store_phone": "string — store phone number if visible",

  "line_items": [
    {{
      "name": "string — item name",
      "quantity": number,
      "unit_price": number or null,
      "total": number or null
    }}
  ]
}}"""


class LLMProvider:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()

    async def extract_expense(self, ocr_text: str) -> ExpenseExtraction:
        if self.provider == "openrouter":
            return await self._call_openrouter(ocr_text)
        if self.provider == "tokenrouter":
            return await self._call_tokenrouter(ocr_text)
        logger.error("Unknown LLM provider: %s", self.provider)
        raise ValueError(f"Unknown LLM provider: {self.provider}")

    async def _call_openrouter(self, ocr_text: str) -> ExpenseExtraction:
        api_key = settings.OPENROUTER_API_KEY
        model = settings.OPENROUTER_MODEL
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured")

        return await self._call_api(
            url="https://openrouter.ai/api/v1/chat/completions",
            api_key=api_key,
            model=model,
            ocr_text=ocr_text,
        )

    async def _call_tokenrouter(self, ocr_text: str) -> ExpenseExtraction:
        api_key = settings.TOKENROUTER_API_KEY
        model = settings.TOKENROUTER_MODEL
        if not api_key:
            raise ValueError("TOKENROUTER_API_KEY is not configured")

        return await self._call_api(
            url="https://tokenrouter.ai/api/v1/chat/completions",
            api_key=api_key,
            model=model,
            ocr_text=ocr_text,
        )

    async def _call_api(
        self,
        url: str,
        api_key: str,
        model: str,
        ocr_text: str,
    ) -> ExpenseExtraction:
        categories_text = "\n".join(f"  - {c}" for c in VALID_CATEGORIES)
        system_prompt = SYSTEM_PROMPT.format(categories=categories_text)
        user_prompt = USER_PROMPT_TEMPLATE.format(ocr_text=ocr_text[:8000])

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.1,
            "max_tokens": 2048,
        }
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        logger.info("LLM request: provider=%s model=%s ocr_chars=%d", self.provider, model, len(ocr_text))
        start = time.time()

        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()

        elapsed_ms = int((time.time() - start) * 1000)
        data = resp.json()
        content = data["choices"][0]["message"]["content"].strip()
        logger.info("LLM response received in %dms (%d chars)", elapsed_ms, len(content))

        extraction = self._parse_response(content)
        return extraction

    def _parse_response(self, content: str) -> ExpenseExtraction:
        content = content.strip()
        if content.startswith("```"):
            lines = content.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            content = "\n".join(lines)

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as e:
            logger.error("Failed to parse LLM JSON: %s\nContent: %s", e, content[:500])
            raise ValueError(f"Invalid JSON from LLM: {e}")

        raw_items = parsed.get("line_items", []) or []
        line_items = []
        for item in raw_items:
            if isinstance(item, dict) and item.get("name"):
                line_items.append(LineItem(
                    name=item["name"],
                    quantity=float(item.get("quantity", 1)),
                    unit_price=float(item["unit_price"]) if item.get("unit_price") is not None else None,
                    total=float(item["total"]) if item.get("total") is not None else None,
                ))

        extraction = ExpenseExtraction(
            merchant=parsed.get("merchant"),
            amount=parsed.get("amount"),
            currency=parsed.get("currency") or "INR",
            category=parsed.get("category") or "Other",
            subcategory=parsed.get("subcategory"),
            description=parsed.get("description"),
            expense_date=parsed.get("expense_date"),
            payment_method=parsed.get("payment_method"),
            confidence=float(parsed.get("confidence", 0.0)),
            gst_amount=float(parsed["gst_amount"]) if parsed.get("gst_amount") is not None else None,
            gst_percent=float(parsed["gst_percent"]) if parsed.get("gst_percent") is not None else None,
            cgst=float(parsed["cgst"]) if parsed.get("cgst") is not None else None,
            sgst=float(parsed["sgst"]) if parsed.get("sgst") is not None else None,
            igst=float(parsed["igst"]) if parsed.get("igst") is not None else None,
            subtotal=float(parsed["subtotal"]) if parsed.get("subtotal") is not None else None,
            tax_rate=float(parsed["tax_rate"]) if parsed.get("tax_rate") is not None else None,
            invoice_number=parsed.get("invoice_number"),
            vendor_gstin=parsed.get("vendor_gstin"),
            receipt_number=parsed.get("receipt_number"),
            tip_amount=float(parsed["tip_amount"]) if parsed.get("tip_amount") is not None else None,
            discount_amount=float(parsed["discount_amount"]) if parsed.get("discount_amount") is not None else None,
            total_items=int(parsed["total_items"]) if parsed.get("total_items") is not None else None,
            payment_method_detail=parsed.get("payment_method_detail"),
            card_last_four=parsed.get("card_last_four"),
            upi_id=parsed.get("upi_id"),
            store_address=parsed.get("store_address"),
            store_phone=parsed.get("store_phone"),
            line_items=line_items,
        )
        return extraction.normalize()


_llm_provider: LLMProvider | None = None


def get_llm_provider() -> LLMProvider:
    global _llm_provider
    if _llm_provider is None:
        _llm_provider = LLMProvider()
    return _llm_provider
