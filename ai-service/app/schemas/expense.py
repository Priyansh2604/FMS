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


class LineItem(BaseModel):
    name: str
    quantity: float = 1.0
    unit_price: Optional[float] = None
    total: Optional[float] = None


class ExpenseExtraction(BaseModel):
    merchant: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0)
    currency: str = "INR"
    category: str = "Other"
    description: Optional[str] = None
    expense_date: Optional[str] = None
    payment_method: Optional[str] = None
    confidence: float = Field(0.0, ge=0.0, le=1.0)

    gst_amount: Optional[float] = Field(None, ge=0)
    gst_percent: Optional[float] = Field(None, ge=0, le=100)
    cgst: Optional[float] = Field(None, ge=0)
    sgst: Optional[float] = Field(None, ge=0)
    igst: Optional[float] = Field(None, ge=0)
    subtotal: Optional[float] = Field(None, ge=0)
    invoice_number: Optional[str] = None
    vendor_gstin: Optional[str] = None
    line_items: list[LineItem] = []

    def normalize(self) -> "ExpenseExtraction":
        self.category = normalize_category(self.category)
        if self.amount is not None:
            self.amount = round(self.amount, 2)
        if self.merchant:
            self.merchant = self.merchant.strip().title()
        if self.gst_amount is not None:
            self.gst_amount = round(self.gst_amount, 2)
        if self.cgst is not None:
            self.cgst = round(self.cgst, 2)
        if self.sgst is not None:
            self.sgst = round(self.sgst, 2)
        if self.igst is not None:
            self.igst = round(self.igst, 2)
        if self.subtotal is not None:
            self.subtotal = round(self.subtotal, 2)
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
    gst_amount: Optional[float] = None
    gst_percent: Optional[float] = None
    cgst: Optional[float] = None
    sgst: Optional[float] = None
    igst: Optional[float] = None
    subtotal: Optional[float] = None
    invoice_number: Optional[str] = None
    vendor_gstin: Optional[str] = None
    line_items: list[dict] = []
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
