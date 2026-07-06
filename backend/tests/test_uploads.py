import io

import pytest
from PIL import Image

from conftest import as_user, client, remove_auth_override, reset_current_user, restore_auth_override
from routes import uploads as uploads_module


@pytest.fixture(autouse=True)
def isolated_upload_root(tmp_path, monkeypatch):
    monkeypatch.setattr(uploads_module, "UPLOAD_ROOT", tmp_path)
    reset_current_user()
    yield tmp_path


def make_png_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (4, 4), color="cyan").save(buffer, format="PNG")
    return buffer.getvalue()


def test_valid_image_upload_is_converted_and_stored(isolated_upload_root):
    as_user("user_a")
    resp = client.post(
        "/uploads/",
        files={"file": ("dive.png", make_png_bytes(), "image/png")},
    )
    assert resp.status_code == 201
    url = resp.json()["url"]
    assert "/uploads/user_a/" in url
    assert url.endswith(".jpg")

    stored_files = list((isolated_upload_root / "user_a").glob("*.jpg"))
    assert len(stored_files) == 1
    # Re-opening confirms it was actually re-encoded as a real JPEG, not just renamed.
    with Image.open(stored_files[0]) as saved:
        assert saved.format == "JPEG"


def test_rejects_disallowed_content_type():
    resp = client.post(
        "/uploads/",
        files={"file": ("dive.pdf", b"%PDF-1.4 not an image", "application/pdf")},
    )
    assert resp.status_code == 415


def test_rejects_content_that_is_not_actually_an_image():
    resp = client.post(
        "/uploads/",
        files={"file": ("dive.jpg", b"this is not image data", "image/jpeg")},
    )
    assert resp.status_code == 400


def test_rejects_oversized_upload(monkeypatch):
    monkeypatch.setattr(uploads_module, "MAX_UPLOAD_BYTES", 10)
    resp = client.post(
        "/uploads/",
        files={"file": ("dive.png", make_png_bytes(), "image/png")},
    )
    assert resp.status_code == 413


def test_upload_requires_authentication():
    remove_auth_override()
    try:
        resp = client.post(
            "/uploads/",
            files={"file": ("dive.png", make_png_bytes(), "image/png")},
        )
        assert resp.status_code in (401, 403)
    finally:
        restore_auth_override()


def test_two_users_photos_are_stored_separately(isolated_upload_root):
    as_user("user_a")
    client.post("/uploads/", files={"file": ("a.png", make_png_bytes(), "image/png")})

    as_user("user_b")
    client.post("/uploads/", files={"file": ("b.png", make_png_bytes(), "image/png")})

    assert len(list((isolated_upload_root / "user_a").glob("*.jpg"))) == 1
    assert len(list((isolated_upload_root / "user_b").glob("*.jpg"))) == 1
