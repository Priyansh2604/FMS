from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    LLM_PROVIDER: str = "openrouter"

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "openai/gpt-4o-mini"

    TOKENROUTER_API_KEY: str = ""
    TOKENROUTER_MODEL: str = "openai/gpt-4o-mini"

    OCR_ENGINE: str = "tesseract"
    TESSERACT_CMD: str = ""
    POPPLER_PATH: str = ""

    NODE_SERVER_URL: str = "http://localhost:5000"
    FASTAPI_PORT: int = 8000

    CORS_ORIGINS: str = "http://localhost:5000,http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
