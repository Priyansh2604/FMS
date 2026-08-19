import logging
from fastapi import APIRouter, File, UploadFile, Query, HTTPException
from fastapi.responses import JSONResponse

from app.services.expense_service import process_receipt
from app.services.supabase_service import get_user_expenses, count_user_expenses
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
