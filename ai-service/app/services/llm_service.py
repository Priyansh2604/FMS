import json
import logging
import time

import httpx

from app.config import settings
from app.schemas.expense import ExpenseExtraction, VALID_CATEGORIES

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expense extraction engine for AURA Finance.

Extract structured financial information from OCR text.

Rules:
- Never invent information. If a value is missing, return null.
- Normalize currency (INR, USD, EUR, etc.).
- Normalize the merchant name (title case, remove extra symbols).
- Determine the most appropriate expense category from the allowed list.
- When multiple monetary values exist, prefer the final payable/total amount.
- Date should be in YYYY-MM-DD format when possible.
- Return ONLY valid JSON matching the provided schema.
- Do not return markdown. Do not explain your answer.

Allowed categories:
{categories}""".format(categories="\n".join(f"- {c}" for c in VALID_CATEGORIES))

USER_PROMPT_TEMPLATE = """Extract the expense from this receipt text:

---
{ocr_text}
---

Return a JSON object with these fields:
{{
  "merchant": "string or null",
  "amount": number or null,
  "currency": "string (default INR)",
  "category": "one of the allowed categories",
  "description": "string or null",
  "expense_date": "YYYY-MM-DD or null",
  "payment_method": "string or null",
  "confidence": 0.0 to 1.0
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
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": USER_PROMPT_TEMPLATE.format(ocr_text=ocr_text)},
            ],
            "temperature": 0.1,
            "max_tokens": 1024,
        }
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        logger.info("LLM request: provider=%s model=%s", self.provider, model)
        start = time.time()

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()

        elapsed_ms = int((time.time() - start) * 1000)
        data = resp.json()
        content = data["choices"][0]["message"]["content"].strip()
        logger.info("LLM response received in %dms", elapsed_ms)

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

        extraction = ExpenseExtraction(
            merchant=parsed.get("merchant"),
            amount=parsed.get("amount"),
            currency=parsed.get("currency", "INR"),
            category=parsed.get("category", "Other"),
            description=parsed.get("description"),
            expense_date=parsed.get("expense_date"),
            payment_method=parsed.get("payment_method"),
            confidence=float(parsed.get("confidence", 0.0)),
        )
        return extraction.normalize()


_llm_provider: LLMProvider | None = None


def get_llm_provider() -> LLMProvider:
    global _llm_provider
    if _llm_provider is None:
        _llm_provider = LLMProvider()
    return _llm_provider
