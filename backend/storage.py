import os
import uuid
from pathlib import Path
from urllib.parse import urlparse

UPLOAD_ROOT = Path(__file__).resolve().parent / "uploads"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}

# Generic S3-API env vars (not R2- or MinIO-specific): MinIO locally and
# Cloudflare R2 in production both speak the same S3 API, so pointing this at
# a real bucket later is just an env change, not a code change.
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
S3_ACCESS_KEY_ID = os.getenv("S3_ACCESS_KEY_ID")
S3_SECRET_ACCESS_KEY = os.getenv("S3_SECRET_ACCESS_KEY")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
S3_PUBLIC_BASE_URL = os.getenv("S3_PUBLIC_BASE_URL")

# Opting into S3-compatible storage requires a bucket name; leaving every
# S3_* var unset keeps the original local-disk behavior untouched.
USE_S3 = bool(S3_BUCKET_NAME)


def _s3_client():
    import boto3  # imported lazily so boto3 is only required when S3 is in use

    return boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT_URL,
        aws_access_key_id=S3_ACCESS_KEY_ID,
        aws_secret_access_key=S3_SECRET_ACCESS_KEY,
    )


def save_photo(user_id: str, contents: bytes, *, base_url: str) -> str:
    """Persist an already-encoded JPEG and return its publicly reachable URL."""
    filename = f"{uuid.uuid4().hex}.jpg"
    key = f"{user_id}/{filename}"

    if USE_S3:
        _s3_client().put_object(
            Bucket=S3_BUCKET_NAME, Key=key, Body=contents, ContentType="image/jpeg"
        )
        return f"{S3_PUBLIC_BASE_URL.rstrip('/')}/{key}"

    user_dir = UPLOAD_ROOT / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    (user_dir / filename).write_bytes(contents)
    return f"{base_url.rstrip('/')}/uploads/{key}"


def delete_photo(url: str) -> None:
    """Best-effort delete of a previously saved photo.

    Missing files/keys are skipped quietly rather than raising, since the url
    is stored data the caller doesn't fully control and the object it points
    to may already be gone.
    """
    if USE_S3:
        prefix = f"{S3_PUBLIC_BASE_URL.rstrip('/')}/"
        if not url.startswith(prefix):
            return
        key = url[len(prefix):]
        _s3_client().delete_object(Bucket=S3_BUCKET_NAME, Key=key)
        return

    relative_path = urlparse(url).path.removeprefix("/uploads/")
    photo_path = (UPLOAD_ROOT / relative_path).resolve()
    # Confirm the resolved path still lands inside UPLOAD_ROOT before removing
    # anything, since the url is stored data rather than a value we can fully
    # trust to be a clean relative path.
    if photo_path.is_relative_to(UPLOAD_ROOT.resolve()) and photo_path.is_file():
        photo_path.unlink()
