from pydantic import BaseModel, Field
from typing import Optional

VALID_CATEGORIES = [
    "Food",
    "Groceries",
    "Transport",
    "Shopping",
    "Entertainment",
    "Bills",
    "Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Rent",
    "Insurance",
    "Subscriptions",
    "Salary",
    "Investment",
    "Other",
]

CATEGORY_ALIASES = {
    "restaurant": "Food",
    "dining": "Food",
    "cafe": "Food",
    "coffee": "Food",
    "swiggy": "Food",
    "zomato": "Food",
    "uber eats": "Food",
    "supermarket": "Groceries",
    "bigbasket": "Groceries",
    "blinkit": "Groceries",
    "zepto": "Groceries",
    "instamart": "Groceries",
    "ola": "Transport",
    "uber": "Transport",
    "rapido": "Transport",
    "metro": "Transport",
    "petrol": "Transport",
    "fuel": "Transport",
    "parking": "Transport",
    "flipkart": "Shopping",
    "amazon": "Shopping",
    "myntra": "Shopping",
    "ajio": "Shopping",
    "movie": "Entertainment",
    "netflix": "Subscriptions",
    "hotstar": "Subscriptions",
    "spotify": "Subscriptions",
    "prime": "Subscriptions",
    "youtube premium": "Subscriptions",
    "jio": "Bills",
    "airtel": "Bills",
    "vi": "Bills",
    "bsnl": "Bills",
    "electricity": "Utilities",
    "water": "Utilities",
    "gas": "Utilities",
    "insurance": "Insurance",
    "hospital": "Healthcare",
    "pharmacy": "Healthcare",
    "medical": "Healthcare",
    "doctor": "Healthcare",
    "college": "Education",
    "school": "Education",
    "course": "Education",
    "udemy": "Education",
    "hotel": "Travel",
    "flight": "Travel",
    "irctc": "Travel",
    "makemytrip": "Travel",
}


def normalize_category(raw: str | None) -> str:
    if not raw:
        return "Other"
    cleaned = raw.strip()
    if cleaned in VALID_CATEGORIES:
        return cleaned
    lower = cleaned.lower()
    if lower in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[lower]
    for alias, cat in CATEGORY_ALIASES.items():
        if alias in lower or lower in alias:
            return cat
    return "Other"


class ExpenseExtraction(BaseModel):
    merchant: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0)
    currency: str = "INR"
    category: str = "Other"
    description: Optional[str] = None
    expense_date: Optional[str] = None
    payment_method: Optional[str] = None
    confidence: float = Field(0.0, ge=0.0, le=1.0)

    def normalize(self) -> "ExpenseExtraction":
        self.category = normalize_category(self.category)
        if self.amount is not None:
            self.amount = round(self.amount, 2)
        if self.merchant:
            self.merchant = self.merchant.strip().title()
        return self


class OCRResult(BaseModel):
    text: str = ""
    confidence: float = 0.0
    engine: str = "tesseract"
    page_count: int = 1


class ConfidenceScores(BaseModel):
    ocr: float = 0.0
    llm: float = 0.0
    amount: float = 0.0
    date: float = 0.0
    merchant: float = 0.0
    overall: float = 0.0


class ExpenseExtractionResult(BaseModel):
    extraction: ExpenseExtraction
    ocr_result: OCRResult
    confidence_scores: ConfidenceScores
    processing_time_ms: int = 0


class ProcessedExpense(BaseModel):
    id: str
    user_id: str
    merchant: Optional[str] = None
    amount: float
    currency: str = "INR"
    category: str
    description: Optional[str] = None
    expense_date: Optional[str] = None
    payment_method: Optional[str] = None
    source: str = "receipt"
    ocr_text: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_category_confidence: Optional[float] = None
    receipt_url: Optional[str] = None
    duplicate_detected: bool = False
    duplicate_of: Optional[str] = None
    created_at: Optional[str] = None


class ProcessExpenseResponse(BaseModel):
    success: bool
    expense: Optional[ProcessedExpense] = None
    error: Optional[dict] = None


class ExpenseListResponse(BaseModel):
    success: bool
    expenses: list[dict]
    total: int
    page: int
    limit: int


class BatchProcessResponse(BaseModel):
    total: int
    successful: int
    failed: int
    expenses: list[ProcessedExpense]
    errors: list[dict]
