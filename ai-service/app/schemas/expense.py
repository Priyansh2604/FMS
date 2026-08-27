from pydantic import BaseModel, Field
from typing import Optional

VALID_CATEGORIES = [
    "Food & Dining",
    "Groceries",
    "Transport",
    "Shopping",
    "Entertainment",
    "Bills & Recharge",
    "Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Rent",
    "Insurance",
    "Subscriptions",
    "Salary",
    "Investment",
    "Personal Care",
    "Home & Kitchen",
    "Electronics",
    "Gifts & Donations",
    "Fuel & Parking",
    "Taxes & Fees",
    "Professional Services",
    "Pets",
    "Kids & Baby",
    "Sports & Fitness",
    "Other",
]

CATEGORY_ALIASES = {
    "restaurant": "Food & Dining",
    "dining": "Food & Dining",
    "cafe": "Food & Dining",
    "coffee": "Food & Dining",
    "swiggy": "Food & Dining",
    "zomato": "Food & Dining",
    "uber eats": "Food & Dining",
    "dominos": "Food & Dining",
    "pizza": "Food & Dining",
    "mcdonalds": "Food & Dining",
    "kfc": "Food & Dining",
    "subway": "Food & Dining",
    "bar": "Food & Dining",
    "pub": "Food & Dining",
    "bakery": "Food & Dining",
    "sweet": "Food & Dining",
    "tea": "Food & Dining",
    "juice": "Food & Dining",
    "supermarket": "Groceries",
    "bigbasket": "Groceries",
    "blinkit": "Groceries",
    "zepto": "Groceries",
    "instamart": "Groceries",
    "dmart": "Groceries",
    "more": "Groceries",
    "reliance fresh": "Groceries",
    "grocery": "Groceries",
    "vegetable": "Groceries",
    "fruit": "Groceries",
    "ola": "Transport",
    "uber": "Transport",
    "rapido": "Transport",
    "metro": "Transport",
    "auto": "Transport",
    "bus": "Transport",
    "train": "Transport",
    "railway": "Transport",
    "cab": "Transport",
    "ola rapido": "Transport",
    "parking": "Transport",
    "toll": "Transport",
    "flipkart": "Shopping",
    "amazon": "Shopping",
    "myntra": "Shopping",
    "ajio": "Shopping",
    "meesho": "Shopping",
    "nykaa": "Shopping",
    "decathlon": "Shopping",
    "clothing": "Shopping",
    "apparel": "Shopping",
    "fashion": "Shopping",
    "movie": "Entertainment",
    "pvr": "Entertainment",
    "inox": "Entertainment",
    "game": "Entertainment",
    "gaming": "Entertainment",
    "book": "Entertainment",
    "netflix": "Subscriptions",
    "hotstar": "Subscriptions",
    "disney": "Subscriptions",
    "spotify": "Subscriptions",
    "prime": "Subscriptions",
    "youtube premium": "Subscriptions",
    "jiocinema": "Subscriptions",
    "zee5": "Subscriptions",
    "sony liv": "Subscriptions",
    "apple music": "Subscriptions",
    "cloud storage": "Subscriptions",
    "jio": "Bills & Recharge",
    "airtel": "Bills & Recharge",
    "vi": "Bills & Recharge",
    "bsnl": "Bills & Recharge",
    "recharge": "Bills & Recharge",
    "mobile bill": "Bills & Recharge",
    "broadband": "Bills & Recharge",
    "wifi": "Bills & Recharge",
    "dth": "Bills & Recharge",
    "electricity": "Utilities",
    "water": "Utilities",
    "gas": "Utilities",
    "sewage": "Utilities",
    "maintenance": "Utilities",
    "society": "Utilities",
    "insurance": "Insurance",
    "health insurance": "Insurance",
    "car insurance": "Insurance",
    "life insurance": "Insurance",
    "hospital": "Healthcare",
    "pharmacy": "Healthcare",
    "medical": "Healthcare",
    "doctor": "Healthcare",
    "clinic": "Healthcare",
    "diagnostic": "Healthcare",
    "lab": "Healthcare",
    "medicine": "Healthcare",
    "college": "Education",
    "school": "Education",
    "course": "Education",
    "udemy": "Education",
    "unacademy": "Education",
    "byju": "Education",
    "tuition": "Education",
    " coaching": "Education",
    "book": "Education",
    "exam": "Education",
    "hotel": "Travel",
    "flight": "Travel",
    "irctc": "Travel",
    "makemytrip": "Travel",
    "booking": "Travel",
    "airbnb": "Travel",
    "visa": "Travel",
    "tour": "Travel",
    "salon": "Personal Care",
    "barber": "Personal Care",
    "beauty": "Personal Care",
    "parlour": "Personal Care",
    "cosmetic": "Personal Care",
    "furniture": "Home & Kitchen",
    "ikea": "Home & Kitchen",
    "decor": "Home & Kitchen",
    "appliance": "Home & Kitchen",
    "kitchen": "Home & Kitchen",
    "home": "Home & Kitchen",
    "croma": "Electronics",
    " Reliance Digital": "Electronics",
    "apple": "Electronics",
    "samsung": "Electronics",
    "headphone": "Electronics",
    "charger": "Electronics",
    "cable": "Electronics",
    "gift": "Gifts & Donations",
    "donation": "Gifts & Donations",
    "charity": "Gifts & Donations",
    "petrol": "Fuel & Parking",
    "diesel": "Fuel & Parking",
    "fuel": "Fuel & Parking",
    "petrol pump": "Fuel & Parking",
    "hpcl": "Fuel & Parking",
    "bpcl": "Fuel & Parking",
    "iocl": "Fuel & Parking",
    "income tax": "Taxes & Fees",
    "gst": "Taxes & Fees",
    "stamp duty": "Taxes & Fees",
    "penalty": "Taxes & Fees",
    "fine": "Taxes & Fees",
    "registration": "Taxes & Fees",
    "lawyer": "Professional Services",
    "ca": "Professional Services",
    "chartered accountant": "Professional Services",
    "consultant": "Professional Services",
    "freelancer": "Professional Services",
    "vet": "Pets",
    "pet": "Pets",
    "dog": "Pets",
    "cat": "Pets",
    "petshop": "Pets",
    "child": "Kids & Baby",
    "baby": "Kids & Baby",
    "diaper": "Kids & Baby",
    "toy": "Kids & Baby",
    "gym": "Sports & Fitness",
    "fitness": "Sports & Fitness",
    "yoga": "Sports & Fitness",
    "sport": "Sports & Fitness",
    "cricket": "Sports & Fitness",
    "swimming": "Sports & Fitness",
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
    subcategory: Optional[str] = None
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

    tip_amount: Optional[float] = Field(None, ge=0)
    discount_amount: Optional[float] = Field(None, ge=0)
    total_items: Optional[int] = Field(None, ge=0)
    payment_method_detail: Optional[str] = None
    card_last_four: Optional[str] = None
    upi_id: Optional[str] = None
    store_address: Optional[str] = None
    store_phone: Optional[str] = None
    receipt_number: Optional[str] = None
    tax_rate: Optional[float] = Field(None, ge=0, le=100)

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
        if self.tip_amount is not None:
            self.tip_amount = round(self.tip_amount, 2)
        if self.discount_amount is not None:
            self.discount_amount = round(self.discount_amount, 2)
        return self


class OCRResult(BaseModel):
    text: str = ""
    confidence: float = 0.0
    engine: str = "rapidocr"
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
    subcategory: Optional[str] = None
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
    tip_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    total_items: Optional[int] = None
    payment_method_detail: Optional[str] = None
    card_last_four: Optional[str] = None
    upi_id: Optional[str] = None
    store_address: Optional[str] = None
    store_phone: Optional[str] = None
    receipt_number: Optional[str] = None
    tax_rate: Optional[float] = None
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
