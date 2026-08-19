import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes.health import router as health_router
from app.api.routes.expenses import router as expenses_router

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(asctime)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AURA Finance AI Service",
    description="OCR + LLM-powered expense extraction for AURA Finance",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(expenses_router)


@app.on_event("startup")
async def startup():
    logger.info("AURA AI Service starting on port %s", settings.FASTAPI_PORT)


@app.on_event("shutdown")
async def shutdown():
    logger.info("AURA AI Service shutting down")
