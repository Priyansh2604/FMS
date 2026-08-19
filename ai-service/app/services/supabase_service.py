import logging
from supabase import create_client, Client

from app.config import settings

logger = logging.getLogger(__name__)

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Supabase client initialized")
    return _client


async def insert_expense(expense: dict) -> dict:
    client = get_client()
    result = client.table("expenses").insert(expense).execute()
    if not result.data:
        raise RuntimeError("Failed to insert expense into Supabase")
    return result.data[0]


async def get_user_expenses(
    user_id: str,
    page: int = 1,
    limit: int = 20,
    category: str | None = None,
) -> list[dict]:
    client = get_client()
    query = client.table("expenses").select("*").eq("user_id", user_id)

    if category:
        query = query.eq("category", category)

    offset = (page - 1) * limit
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)

    result = query.execute()
    return result.data or []


async def count_user_expenses(user_id: str, category: str | None = None) -> int:
    client = get_client()
    query = client.table("expenses").select("id", count="exact").eq("user_id", user_id)
    if category:
        query = query.eq("category", category)
    result = query.execute()
    return result.count or 0


async def find_duplicate(user_id: str, merchant: str, amount: float, expense_date: str) -> dict | None:
    client = get_client()
    result = (
        client.table("expenses")
        .select("id, merchant, amount, expense_date")
        .eq("user_id", user_id)
        .eq("merchant", merchant)
        .eq("amount", amount)
        .eq("expense_date", expense_date)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


async def delete_expense(expense_id: str, user_id: str) -> bool:
    client = get_client()
    result = (
        client.table("expenses")
        .delete()
        .eq("id", expense_id)
        .eq("user_id", user_id)
        .execute()
    )
    return bool(result.data)
