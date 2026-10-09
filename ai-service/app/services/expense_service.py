import json
import logging
import time
import uuid

from app.services.ocr_service import extract_text_from_file
from app.services.llm_service import get_llm_provider
from app.services.supabase_service import insert_expense, find_duplicate, upload_receipt, get_learned_categories
from app.schemas.expense import (
    ExpenseExtraction,
    ExpenseExtractionResult,
    ProcessedExpense,
    ConfidenceScores,
    VALID_CATEGORIES,
    CATEGORY_ALIASES,
)
from app.utils.file_utils import save_temp_file, cleanup_file, is_valid_receipt

logger = logging.getLogger(__name__)


_learned_index: dict[str, str] | None = None


async def _get_learned_index() -> dict[str, str]:
    global _learned_index
    if _learned_index is not None:
        return _learned_index
    learned = await get_learned_categories()
    _learned_index = {}
    for entry in learned:
        sub_lower = entry["subcategory"].lower().strip()
        _learned_index[sub_lower] = entry["category"]
    return _learned_index


async def resolve_category(raw_category: str | None, subcategory: str | None) -> str:
    from app.schemas.expense import normalize_category

    result = normalize_category(raw_category)
    if result != "Other":
        return result

    if subcategory:
        sub_lower = subcategory.lower().strip()
        learned = await _get_learned_index()
        if sub_lower in learned:
            return learned[sub_lower]
        for learned_sub, learned_cat in learned.items():
            if sub_lower in learned_sub or learned_sub in sub_lower:
                return learned_cat

    return "Other"


def calculate_confidence(
    ocr_confidence: float,
    llm_confidence: float,
    has_amount: bool,
    has_date: bool,
    has_merchant: bool,
) -> ConfidenceScores:
    amount_c = 1.0 if has_amount else 0.0
    date_c = 1.0 if has_date else 0.0
    merchant_c = 1.0 if has_merchant else 0.0
    overall = (
        ocr_confidence * 0.2
        + llm_confidence * 0.3
        + amount_c * 0.2
        + date_c * 0.15
        + merchant_c * 0.15
    )
    return ConfidenceScores(
        ocr=ocr_confidence,
        llm=llm_confidence,
        amount=amount_c,
        date=date_c,
        merchant=merchant_c,
        overall=round(overall, 3),
    )


async def extract_invoice_data(file_path: str, content_type: str) -> ExpenseExtractionResult:
    start = time.time()

    ocr_result = await extract_text_from_file(file_path)

    if not ocr_result.text.strip():
        logger.warning("OCR returned empty text for %s", file_path)
        return ExpenseExtractionResult(
            extraction=ExpenseExtraction(category="Other", confidence=0.0),
            ocr_result=ocr_result,
            confidence_scores=ConfidenceScores(),
            processing_time_ms=int((time.time() - start) * 1000),
        )

    llm = get_llm_provider()
    extraction = await llm.extract_expense(ocr_result.text)

    confidence_scores = calculate_confidence(
        ocr_confidence=ocr_result.confidence,
        llm_confidence=extraction.confidence,
        has_amount=extraction.amount is not None,
        has_date=extraction.expense_date is not None,
        has_merchant=extraction.merchant is not None,
    )
    extraction.confidence = confidence_scores.overall

    elapsed_ms = int((time.time() - start) * 1000)
    logger.info(
        "Extraction complete: merchant=%s amount=%s category=%s items=%d confidence=%.3f time=%dms",
        extraction.merchant,
        extraction.amount,
        extraction.category,
        len(extraction.line_items),
        confidence_scores.overall,
        elapsed_ms,
    )

    return ExpenseExtractionResult(
        extraction=extraction,
        ocr_result=ocr_result,
        confidence_scores=confidence_scores,
        processing_time_ms=elapsed_ms,
    )


async def process_receipt(
    file_content: bytes,
    filename: str,
    content_type: str,
    user_id: str,
) -> ProcessedExpense:
    temp_path = None
    try:
        if not is_valid_receipt(filename, content_type):
            raise ValueError(f"Unsupported file type: {content_type or filename}")

        safe_suffix = "_" + "".join(c if c.isalnum() or c in "-_" else "_" for c in filename)[:40]
        temp_path = save_temp_file(file_content, suffix=safe_suffix)

        result = await extract_invoice_data(temp_path, content_type)
        extraction = result.extraction

        if extraction.amount is None:
            raise ValueError("Could not extract amount from the receipt. Please try a clearer image or enter manually.")

        resolved_category = await resolve_category(extraction.category, extraction.subcategory)

        receipt_url = await upload_receipt(file_content, filename, user_id)

        duplicate = await find_duplicate(
            user_id=user_id,
            merchant=extraction.merchant or "",
            amount=extraction.amount,
            expense_date=extraction.expense_date,
        )

        expense_row = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "amount": extraction.amount,
            "currency": extraction.currency,
            "category": resolved_category,
            "subcategory": extraction.subcategory,
            "description": extraction.description,
            "merchant": extraction.merchant,
            "expense_date": extraction.expense_date,
            "payment_method": extraction.payment_method,
            "source": "receipt",
            "ocr_text": result.ocr_result.text[:5000],
            "ai_confidence": result.confidence_scores.overall,
            "ai_category_confidence": extraction.confidence,
            "duplicate_of": duplicate["id"] if duplicate else None,
            "receipt_url": receipt_url,
            "gst_amount": extraction.gst_amount,
            "gst_percent": extraction.gst_percent,
            "cgst": extraction.cgst,
            "sgst": extraction.sgst,
            "igst": extraction.igst,
            "subtotal": extraction.subtotal,
            "tax_rate": extraction.tax_rate,
            "invoice_number": extraction.invoice_number,
            "vendor_gstin": extraction.vendor_gstin,
            "receipt_number": extraction.receipt_number,
            "tip_amount": extraction.tip_amount,
            "discount_amount": extraction.discount_amount,
            "total_items": extraction.total_items,
            "payment_method_detail": extraction.payment_method_detail,
            "card_last_four": extraction.card_last_four,
            "upi_id": extraction.upi_id,
            "store_address": extraction.store_address,
            "store_phone": extraction.store_phone,
            "line_items": json.dumps([item.model_dump() for item in extraction.line_items]) if extraction.line_items else None,
        }

        inserted = await insert_expense(expense_row)

        return ProcessedExpense(
            id=inserted["id"],
            user_id=user_id,
            merchant=inserted.get("merchant"),
            amount=float(inserted["amount"]),
            currency=inserted["currency"],
            category=inserted["category"],
            subcategory=inserted.get("subcategory"),
            description=inserted.get("description"),
            expense_date=inserted.get("expense_date"),
            payment_method=inserted.get("payment_method"),
            source=inserted["source"],
            ocr_text=inserted.get("ocr_text"),
            ai_confidence=inserted.get("ai_confidence"),
            ai_category_confidence=inserted.get("ai_category_confidence"),
            receipt_url=inserted.get("receipt_url"),
            gst_amount=inserted.get("gst_amount"),
            gst_percent=inserted.get("gst_percent"),
            cgst=inserted.get("cgst"),
            sgst=inserted.get("sgst"),
            igst=inserted.get("igst"),
            subtotal=inserted.get("subtotal"),
            tax_rate=inserted.get("tax_rate"),
            invoice_number=inserted.get("invoice_number"),
            vendor_gstin=inserted.get("vendor_gstin"),
            receipt_number=inserted.get("receipt_number"),
            tip_amount=inserted.get("tip_amount"),
            discount_amount=inserted.get("discount_amount"),
            total_items=inserted.get("total_items"),
            payment_method_detail=inserted.get("payment_method_detail"),
            card_last_four=inserted.get("card_last_four"),
            upi_id=inserted.get("upi_id"),
            store_address=inserted.get("store_address"),
            store_phone=inserted.get("store_phone"),
            line_items=json.loads(inserted["line_items"]) if inserted.get("line_items") else [],
            duplicate_detected=duplicate is not None,
            duplicate_of=duplicate["id"] if duplicate else None,
            created_at=inserted.get("created_at"),
        )

    finally:
        if temp_path:
            cleanup_file(temp_path)
