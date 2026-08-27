from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    user_id: str | None = None


class ChatResponse(BaseModel):
    reply: str


class SuggestionsResponse(BaseModel):
    suggestions: list[str]
