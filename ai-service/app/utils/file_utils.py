import os
import tempfile
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def save_temp_file(content: bytes, suffix: str = ".tmp") -> str:
    fd, path = tempfile.mkstemp(suffix=suffix)
    os.write(fd, content)
    os.close(fd)
    logger.info("Temp file created: %s", path)
    return path


def cleanup_file(path: str) -> None:
    try:
        if path and os.path.exists(path):
            os.remove(path)
            logger.info("Temp file removed: %s", path)
    except OSError as e:
        logger.warning("Failed to remove temp file %s: %s", path, e)


def is_valid_receipt(filename: str, content_type: str) -> bool:
    allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}
    allowed_content_types = {
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
    }
    ext = Path(filename).suffix.lower()
    return ext in allowed_extensions or content_type in allowed_content_types


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()
