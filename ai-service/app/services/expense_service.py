import logging
import time
import uuid

from app.services.ocr_service import extract_text_from_file
from app.services.llm_service import get_llm_provider
from app.services.supabase_service import insert_expense, find_duplicate
from app.schemas.expense import (
    ExpenseExtraction,
    ExpenseExtractionResult,
    ProcessedExpense,
    ConfidenceScores,
)
from app.utils.file_utils import save_temp_file, cleanup_file, is_valid_receipt

logger = logging.getLogger(__name__)


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
        "Extraction complete: merchant=%s amount=%s category=%s confidence=%.3f time=%dms",
        extraction.merchant,
        extraction.amount,
        extraction.category,
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

        temp_path = save_temp_file(file_content, suffix=f"_{filename}")

        result = await extract_invoice_data(temp_path, content_type)
        extraction = result.extraction

        if extraction.amount is None:
            raise ValueError("Could not extract amount from the receipt")

        duplicate = await find_duplicate(
            user_id=user_id,
            merchant=extraction.merchant or "",
            amount=extraction.amount,
            expense_date=extraction.expense_date or "",
        )

        expense_row = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "amount": extraction.amount,
            "currency": extraction.currency,
            "category": extraction.category,
            "description": extraction.description,
            "merchant": extraction.merchant,
            "expense_date": extraction.expense_date,
            "payment_method": extraction.payment_method,
            "source": "receipt",
            "ocr_text": result.ocr_result.text[:5000],
            "ai_confidence": result.confidence_scores.overall,
            "ai_category_confidence": extraction.confidence,
            "duplicate_of": duplicate["id"] if duplicate else None,
        }

        inserted = await insert_expense(expense_row)

        return ProcessedExpense(
            id=inserted["id"],
            user_id=user_id,
            merchant=inserted.get("merchant"),
            amount=float(inserted["amount"]),
            currency=inserted["currency"],
            category=inserted["category"],
            description=inserted.get("description"),
            expense_date=inserted.get("expense_date"),
            payment_method=inserted.get("payment_method"),
            source=inserted["source"],
            ocr_text=inserted.get("ocr_text"),
            ai_confidence=inserted.get("ai_confidence"),
            ai_category_confidence=inserted.get("ai_category_confidence"),
            receipt_url=inserted.get("receipt_url"),
            duplicate_detected=duplicate is not None,
            duplicate_of=duplicate["id"] if duplicate else None,
            created_at=inserted.get("created_at"),
        )

    finally:
        if temp_path:
            cleanup_file(temp_path)
