import logging
import uuid
from fastapi import APIRouter, File, UploadFile, Query, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional

from app.services.expense_service import process_receipt
from app.services.ocr_service import OCRUnavailableError
from app.services.supabase_service import (
    get_user_expenses,
    count_user_expenses,
    create_manual_expense,
    get_expense_summary,
    delete_expense,
)
from app.schemas.expense import ProcessExpenseResponse, ExpenseListResponse, BatchProcessResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/expenses", tags=["expenses"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
}


class ManualExpenseRequest(BaseModel):
    user_id: str
    merchant: Optional[str] = None
    amount: float = Field(..., gt=0)
    currency: str = "INR"
    category: str = "Other"
    description: Optional[str] = None
    expense_date: Optional[str] = None
    payment_method: Optional[str] = None


@router.post("/process", response_model=ProcessExpenseResponse)
async def process_expense(
    file: UploadFile = File(...),
    user_id: str = Query(..., description="Authenticated user ID"),
):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max 10 MB.")

    if file.content_type and file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type: {file.content_type}. Allowed: PDF, JPEG, PNG, WEBP",
        )

    try:
        expense = await process_receipt(
            file_content=content,
            filename=file.filename or "upload.pdf",
            content_type=file.content_type or "application/pdf",
            user_id=user_id,
        )
        return ProcessExpenseResponse(success=True, expense=expense)
    except ValueError as e:
        logger.warning("Extraction failed: %s", e)
        return ProcessExpenseResponse(
            success=False,
            error={"code": "EXTRACTION_FAILED", "message": str(e)},
        )
    except OCRUnavailableError as e:
        logger.warning("OCR unavailable: %s", e)
        return ProcessExpenseResponse(
            success=False,
            error={"code": "OCR_UNAVAILABLE", "message": str(e)},
        )
    except Exception as e:
        logger.error("Processing error: %s", e, exc_info=True)
        return ProcessExpenseResponse(
            success=False,
            error={"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."},
        )


@router.post("/process-batch", response_model=BatchProcessResponse)
async def process_batch(
    files: list[UploadFile] = File(...),
    user_id: str = Query(..., description="Authenticated user ID"),
):
    expenses = []
    errors = []

    for file in files:
        try:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                errors.append({"file": file.filename, "error": "File too large"})
                continue

            expense = await process_receipt(
                file_content=content,
                filename=file.filename or "upload.pdf",
                content_type=file.content_type or "application/pdf",
                user_id=user_id,
            )
            expenses.append(expense)
        except Exception as e:
            logger.error("Batch item failed: %s - %s", file.filename, e)
            errors.append({"file": file.filename, "error": str(e)})

    return BatchProcessResponse(
        total=len(files),
        successful=len(expenses),
        failed=len(errors),
        expenses=expenses,
        errors=errors,
    )


@router.post("/manual")
async def create_manual(body: ManualExpenseRequest):
    try:
        expense_row = {
            "id": str(uuid.uuid4()),
            "user_id": body.user_id,
            "amount": body.amount,
            "currency": body.currency,
            "category": body.category,
            "description": body.description,
            "merchant": body.merchant,
            "expense_date": body.expense_date,
            "payment_method": body.payment_method,
            "source": "manual",
        }
        inserted = await create_manual_expense(expense_row)
        return {"success": True, "expense": inserted}
    except Exception as e:
        logger.error("Manual expense creation failed: %s", e)
        return {"success": False, "error": {"code": "CREATE_FAILED", "message": str(e)}}


@router.get("/summary")
async def expense_summary(user_id: str = Query(..., description="Authenticated user ID")):
    try:
        summary = await get_expense_summary(user_id)
        return {"success": True, **summary}
    except Exception as e:
        logger.error("Summary failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load summary")


@router.delete("/{expense_id}")
async def remove_expense(expense_id: str, user_id: str = Query(...)):
    try:
        deleted = await delete_expense(expense_id, user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Expense not found")
        return {"success": True, "deleted_id": expense_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Delete failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to delete expense")


@router.get("", response_model=ExpenseListResponse)
async def list_expenses(
    user_id: str = Query(..., description="Authenticated user ID"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: str | None = Query(None),
):
    try:
        expenses = await get_user_expenses(user_id, page, limit, category)
        total = await count_user_expenses(user_id, category)
        return ExpenseListResponse(
            success=True,
            expenses=expenses,
            total=total,
            page=page,
            limit=limit,
        )
    except Exception as e:
        logger.error("Failed to list expenses: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load expenses")
