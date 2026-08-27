import logging

from fastapi import APIRouter, HTTPException

from app.schemas.chat import ChatRequest, ChatResponse, SuggestionsResponse
from app.services.chat_service import chat_completion, generate_suggestions

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        messages = [{"role": m.role, "content": m.content} for m in req.messages]
        reply = await chat_completion(messages, user_id=req.user_id)
        return ChatResponse(reply=reply)
    except ValueError as e:
        logger.error("Chat config error: %s", e)
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Chat error: %s", e)
        raise HTTPException(status_code=500, detail=f"Chat failed: {e}")


@router.get("/suggestions", response_model=SuggestionsResponse)
async def suggestions(user_id: str | None = None):
    """Generate dynamic, context-aware suggestion prompts based on live market data."""
    try:
        items = await generate_suggestions(user_id=user_id)
        return SuggestionsResponse(suggestions=items)
    except Exception as e:
        logger.error("Suggestions error: %s", e)
        return SuggestionsResponse(suggestions=[
            "What's the market outlook today?",
            "Should I prepay my home loan?",
            "How to build an emergency fund?",
            "Health vs term insurance — which first?",
            "Best SIP for ₹5,000 monthly?",
            "How to cut monthly expenses?",
        ])
