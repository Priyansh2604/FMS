import logging
import subprocess
import tempfile
from abc import ABC, abstractmethod
from pathlib import Path
import shutil

from app.config import settings
from app.schemas.expense import OCRResult

logger = logging.getLogger(__name__)


class OCRUnavailableError(RuntimeError):
    """Raised when the native OCR executable is not available."""


def _find_tesseract() -> str:
    configured = settings.TESSERACT_CMD.strip()
    candidates = [
        configured,
        shutil.which("tesseract") or "",
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return candidate
    raise OCRUnavailableError(
        "Tesseract OCR is not installed. Install Tesseract or set TESSERACT_CMD in ai-service/.env."
    )


def _find_poppler() -> str | None:
    configured = settings.POPPLER_PATH.strip()
    if configured and Path(configured).is_dir():
        return configured
    if shutil.which("pdftoppm"):
        return None
    candidates = [
        r"C:\Program Files\poppler\Library\bin",
        r"C:\Program Files\poppler\bin",
    ]
    return next((path for path in candidates if Path(path).is_dir()), None)


class OCRProvider(ABC):
    @abstractmethod
    async def extract_text(self, file_path: str) -> OCRResult:
        ...


class TesseractOCR(OCRProvider):
    async def extract_text(self, file_path: str) -> OCRResult:
        import pytesseract

        pytesseract.pytesseract.tesseract_cmd = _find_tesseract()
        ext = Path(file_path).suffix.lower()

        if ext == ".pdf":
            return await self._ocr_pdf(file_path)
        return await self._ocr_image(file_path)

    async def _ocr_image(self, file_path: str) -> OCRResult:
        try:
            import pytesseract
            from PIL import Image

            img = Image.open(file_path)
            text = pytesseract.image_to_string(img)
            data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            confidences = [int(c) for c in data["conf"] if int(c) > 0]
            avg_conf = sum(confidences) / len(confidences) / 100 if confidences else 0.0

            return OCRResult(
                text=text.strip(),
                confidence=round(avg_conf, 3),
                engine="tesseract",
                page_count=1,
            )
        except ImportError:
            logger.error("pytesseract not installed")
            return OCRResult(text="", confidence=0.0, engine="tesseract", page_count=0)
        except OCRUnavailableError:
            raise
        except Exception as e:
            logger.error("Tesseract OCR failed: %s", e)
            return OCRResult(text="", confidence=0.0, engine="tesseract", page_count=0)

    async def _ocr_pdf(self, file_path: str) -> OCRResult:
        try:
            from pdf2image import convert_from_path
            import pytesseract
            from PIL import Image

            pages = convert_from_path(file_path, dpi=300, poppler_path=_find_poppler())
            all_text = []
            all_confidences = []

            for i, page in enumerate(pages):
                text = pytesseract.image_to_string(page)
                all_text.append(f"--- Page {i + 1} ---\n{text}")

                data = pytesseract.image_to_data(page, output_type=pytesseract.Output.DICT)
                confidences = [int(c) for c in data["conf"] if int(c) > 0]
                all_confidences.extend(confidences)

            combined = "\n\n".join(all_text)
            avg_conf = (
                sum(all_confidences) / len(all_confidences) / 100
                if all_confidences
                else 0.0
            )

            return OCRResult(
                text=combined.strip(),
                confidence=round(avg_conf, 3),
                engine="tesseract",
                page_count=len(pages),
            )
        except ImportError:
            logger.error("pdf2image or pytesseract not installed")
            return OCRResult(text="", confidence=0.0, engine="tesseract", page_count=0)
        except OCRUnavailableError:
            raise
        except Exception as e:
            logger.error("PDF OCR failed: %s", e)
            return OCRResult(text="", confidence=0.0, engine="tesseract", page_count=0)


def get_ocr_provider() -> OCRProvider:
    engine = settings.OCR_ENGINE.lower()
    if engine == "tesseract":
        return TesseractOCR()
    logger.warning("Unknown OCR engine '%s', falling back to tesseract", engine)
    return TesseractOCR()


async def extract_text_from_file(file_path: str) -> OCRResult:
    provider = get_ocr_provider()
    logger.info("OCR started with engine=%s for %s", provider.__class__.__name__, file_path)
    result = await provider.extract_text(file_path)
    logger.info(
        "OCR completed: %d chars, confidence=%.3f, pages=%d",
        len(result.text),
        result.confidence,
        result.page_count,
    )
    return result
