import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402

from auth import get_current_user_id  # noqa: E402
from main import app  # noqa: E402

_current_user = {"id": "user_a"}


def _override_get_current_user_id():
    return _current_user["id"]


app.dependency_overrides[get_current_user_id] = _override_get_current_user_id

client = TestClient(app)


def as_user(user_id: str):
    _current_user["id"] = user_id


def reset_current_user():
    _current_user["id"] = "user_a"


def remove_auth_override():
    """Temporarily let requests hit the real auth dependency (e.g. to assert 401s)."""
    app.dependency_overrides.pop(get_current_user_id, None)


def restore_auth_override():
    app.dependency_overrides[get_current_user_id] = _override_get_current_user_id
