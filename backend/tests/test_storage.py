from unittest import mock

import pytest

import storage


@pytest.fixture(autouse=True)
def s3_configured(monkeypatch):
    """Points storage at S3 mode with a fake bucket/public URL for this file.

    Every test also patches storage._s3_client() to a MagicMock, so no real
    network call or MinIO/R2 credentials are ever needed.
    """
    monkeypatch.setattr(storage, "USE_S3", True)
    monkeypatch.setattr(storage, "S3_BUCKET_NAME", "test-bucket")
    monkeypatch.setattr(storage, "S3_PUBLIC_BASE_URL", "https://cdn.test/test-bucket")


def test_save_photo_uploads_to_s3_and_returns_a_public_url():
    fake_client = mock.Mock()
    with mock.patch.object(storage, "_s3_client", return_value=fake_client):
        url = storage.save_photo("user_a", b"jpeg-bytes", base_url="http://ignored")

    fake_client.put_object.assert_called_once()
    call_kwargs = fake_client.put_object.call_args.kwargs
    assert call_kwargs["Bucket"] == "test-bucket"
    assert call_kwargs["Body"] == b"jpeg-bytes"
    assert call_kwargs["ContentType"] == "image/jpeg"
    assert call_kwargs["Key"].startswith("user_a/")
    assert call_kwargs["Key"].endswith(".jpg")

    assert url == f"https://cdn.test/test-bucket/{call_kwargs['Key']}"


def test_save_photo_never_touches_local_disk_when_s3_is_configured(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "UPLOAD_ROOT", tmp_path)
    fake_client = mock.Mock()

    with mock.patch.object(storage, "_s3_client", return_value=fake_client):
        storage.save_photo("user_a", b"jpeg-bytes", base_url="http://ignored")

    assert list(tmp_path.iterdir()) == []


def test_delete_photo_removes_the_matching_s3_object():
    fake_client = mock.Mock()
    url = "https://cdn.test/test-bucket/user_a/abc123.jpg"

    with mock.patch.object(storage, "_s3_client", return_value=fake_client):
        storage.delete_photo(url)

    fake_client.delete_object.assert_called_once_with(Bucket="test-bucket", Key="user_a/abc123.jpg")


def test_delete_photo_ignores_urls_outside_the_configured_bucket():
    """A URL that doesn't match our public base (e.g. a stale/local-disk URL
    left over from before S3 was configured) is skipped rather than deleting
    the wrong object or raising."""
    fake_client = mock.Mock()
    url = "https://some-other-host/unrelated/photo.jpg"

    with mock.patch.object(storage, "_s3_client", return_value=fake_client):
        storage.delete_photo(url)

    fake_client.delete_object.assert_not_called()


def test_falls_back_to_disk_when_s3_is_not_configured(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "USE_S3", False)
    monkeypatch.setattr(storage, "UPLOAD_ROOT", tmp_path)

    url = storage.save_photo("user_a", b"jpeg-bytes", base_url="http://localhost:8000")

    assert url.startswith("http://localhost:8000/uploads/user_a/")
    stored_files = list((tmp_path / "user_a").glob("*.jpg"))
    assert len(stored_files) == 1
    assert stored_files[0].read_bytes() == b"jpeg-bytes"
