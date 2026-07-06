import io
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from PIL import Image, UnidentifiedImageError
from pillow_heif import register_heif_opener

from auth import get_current_user_id
from storage import ALLOWED_CONTENT_TYPES, MAX_UPLOAD_BYTES, UPLOAD_ROOT

register_heif_opener()

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def upload_photo(
    request: Request,
    file: UploadFile,
    user_id: str = Depends(get_current_user_id),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported image type. Use JPEG, PNG, WEBP, or HEIC.",
        )

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds the 10MB limit.",
        )
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file upload.")

    # Decoding with Pillow (rather than trusting the client-supplied
    # content-type) confirms the bytes are really an image and not a
    # disguised payload, and re-encoding to JPEG normalizes every accepted
    # format - including HEIC from iPhone cameras - into something every
    # platform (native and web) can render from the same URL.
    try:
        image = Image.open(io.BytesIO(contents))
        image.load()
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="File is not a valid image.")

    user_dir = UPLOAD_ROOT / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.jpg"
    image.convert("RGB").save(user_dir / filename, format="JPEG", quality=85)

    photo_url = f"{str(request.base_url).rstrip('/')}/uploads/{user_id}/{filename}"
    return {"url": photo_url}
