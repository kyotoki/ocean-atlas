from pathlib import Path

UPLOAD_ROOT = Path(__file__).resolve().parent / "uploads"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}
