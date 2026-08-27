import logging
import tempfile
from abc import ABC, abstractmethod
from pathlib import Path

from app.config import settings
from app.schemas.expense import OCRResult

logger = logging.getLogger(__name__)


class OCRUnavailableError(RuntimeError):
    """Raised when no OCR engine is available."""


class OCRProvider(ABC):
    @abstractmethod
    def extract_text(self, file_path: str) -> OCRResult:
        ...


class RapidOCREngine(OCRProvider):
    """Pure-Python OCR using rapidocr-onnxruntime. No system deps needed."""

    def __init__(self):
        self._engine = None

    def _get_engine(self):
        if self._engine is None:
            from rapidocr_onnxruntime import RapidOCR
            self._engine = RapidOCR()
        return self._engine

    def extract_text(self, file_path: str) -> OCRResult:
        ext = Path(file_path).suffix.lower()
        if ext == ".pdf":
            return self._ocr_pdf(file_path)
        return self._ocr_image(file_path)

    def _ocr_image(self, file_path: str) -> OCRResult:
        try:
            engine = self._get_engine()
            result, _ = engine(file_path)
            if not result:
                return OCRResult(text="", confidence=0.0, engine="rapidocr", page_count=0)

            lines = []
            confidences = []
            for item in result:
                if len(item) >= 3:
                    text_part, confidence = item[1], item[2]
                    lines.append(text_part)
                    confidences.append(confidence)

            full_text = "\n".join(lines)
            avg_conf = sum(confidences) / len(confidences) if confidences else 0.0

            return OCRResult(
                text=full_text.strip(),
                confidence=round(avg_conf, 3),
                engine="rapidocr",
                page_count=1,
            )
        except Exception as e:
            logger.error("RapidOCR image failed: %s", e)
            return OCRResult(text="", confidence=0.0, engine="rapidocr", page_count=0)

    def _ocr_pdf(self, file_path: str) -> OCRResult:
        try:
            from PIL import Image
            import fitz  # PyMuPDF
        except ImportError:
            logger.warning("PyMuPDF not installed, trying pdf2image fallback")
            return self._ocr_pdf_pdf2image(file_path)

        try:
            doc = fitz.open(file_path)
            all_text = []
            all_confidences = []

            for page_num in range(len(doc)):
                page = doc[page_num]
                pix = page.get_pixmap(dpi=300)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

                with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                    img.save(tmp.name)
                    engine = self._get_engine()
                    result, _ = engine(tmp.name)
                    Path(tmp.name).unlink(missing_ok=True)

                if result:
                    page_lines = []
                    for item in result:
                        if len(item) >= 3:
                            page_lines.append(item[1])
                            all_confidences.append(item[2])
                    all_text.append(f"--- Page {page_num + 1} ---\n" + "\n".join(page_lines))

            doc.close()
            combined = "\n\n".join(all_text)
            avg_conf = sum(all_confidences) / len(all_confidences) if all_confidences else 0.0

            return OCRResult(
                text=combined.strip(),
                confidence=round(avg_conf, 3),
                engine="rapidocr",
                page_count=len(doc) if doc else 1,
            )
        except Exception as e:
            logger.error("RapidOCR PDF failed: %s", e)
            return OCRResult(text="", confidence=0.0, engine="rapidocr", page_count=0)

    def _ocr_pdf_pdf2image(self, file_path: str) -> OCRResult:
        try:
            from pdf2image import convert_from_path
            pages = convert_from_path(file_path, dpi=300)
            engine = self._get_engine()
            all_text = []
            all_confidences = []

            for i, page in enumerate(pages):
                with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                    page.save(tmp.name)
                    result, _ = engine(tmp.name)
                    Path(tmp.name).unlink(missing_ok=True)

                if result:
                    page_lines = []
                    for item in result:
                        if len(item) >= 3:
                            page_lines.append(item[1])
                            all_confidences.append(item[2])
                    all_text.append(f"--- Page {i + 1} ---\n" + "\n".join(page_lines))

            combined = "\n\n".join(all_text)
            avg_conf = sum(all_confidences) / len(all_confidences) if all_confidences else 0.0

            return OCRResult(
                text=combined.strip(),
                confidence=round(avg_conf, 3),
                engine="rapidocr",
                page_count=len(pages),
            )
        except Exception as e:
            logger.error("RapidOCR PDF (pdf2image) failed: %s", e)
            return OCRResult(text="", confidence=0.0, engine="rapidocr", page_count=0)


class TesseractOCR(OCRProvider):
    def extract_text(self, file_path: str) -> OCRResult:
        try:
            import shutil
            tesseract_cmd = settings.TESSERACT_CMD.strip() or shutil.which("tesseract") or ""
            if tesseract_cmd and Path(tesseract_cmd).is_file():
                import pytesseract
                pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
            else:
                raise OCRUnavailableError("Tesseract not found")

            ext = Path(file_path).suffix.lower()
            if ext == ".pdf":
                return self._ocr_pdf(file_path)
            return self._ocr_image(file_path)
        except OCRUnavailableError:
            raise
        except ImportError:
            raise OCRUnavailableError("pytesseract not installed")
        except Exception as e:
            logger.error("Tesseract failed: %s", e)
            return OCRResult(text="", confidence=0.0, engine="tesseract", page_count=0)

    def _ocr_image(self, file_path: str) -> OCRResult:
        import pytesseract
        from PIL import Image

        img = Image.open(file_path)
        text = pytesseract.image_to_string(img)
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        confidences = [int(c) for c in data["conf"] if int(c) > 0]
        avg_conf = sum(confidences) / len(confidences) / 100 if confidences else 0.0

        return OCRResult(text=text.strip(), confidence=round(avg_conf, 3), engine="tesseract", page_count=1)

    def _ocr_pdf(self, file_path: str) -> OCRResult:
        from pdf2image import convert_from_path
        import pytesseract
        import shutil

        poppler = settings.POPPLER_PATH.strip() or None
        pages = convert_from_path(file_path, dpi=300, poppler_path=poppler)
        all_text = []
        all_confidences = []

        for i, page in enumerate(pages):
            text = pytesseract.image_to_string(page)
            all_text.append(f"--- Page {i + 1} ---\n{text}")
            data = pytesseract.image_to_data(page, output_type=pytesseract.Output.DICT)
            confidences = [int(c) for c in data["conf"] if int(c) > 0]
            all_confidences.extend(confidences)

        combined = "\n\n".join(all_text)
        avg_conf = sum(all_confidences) / len(all_confidences) / 100 if all_confidences else 0.0

        return OCRResult(text=combined.strip(), confidence=round(avg_conf, 3), engine="tesseract", page_count=len(pages))


def get_ocr_provider() -> OCRProvider:
    engine = settings.OCR_ENGINE.lower()

    if engine == "tesseract":
        try:
            import shutil
            tesseract_cmd = settings.TESSERACT_CMD.strip() or shutil.which("tesseract") or ""
            if tesseract_cmd and Path(tesseract_cmd).is_file():
                logger.info("Using Tesseract OCR engine")
                return TesseractOCR()
        except Exception:
            pass
        logger.warning("Tesseract not found, trying RapidOCR")

    try:
        from rapidocr_onnxruntime import RapidOCR
        RapidOCR()
        logger.info("Using RapidOCR engine (no system deps)")
        return RapidOCREngine()
    except ImportError:
        pass

    raise OCRUnavailableError(
        "No OCR engine available. Install rapidocr-onnxruntime (pip install rapidocr-onnxruntime) "
        "or Tesseract OCR."
    )


async def extract_text_from_file(file_path: str) -> OCRResult:
    provider = get_ocr_provider()
    logger.info("OCR started with engine=%s for %s", provider.__class__.__name__, file_path)
    result = provider.extract_text(file_path)
    logger.info(
        "OCR completed: %d chars, confidence=%.3f, pages=%d",
        len(result.text),
        result.confidence,
        result.page_count,
    )
    return result
