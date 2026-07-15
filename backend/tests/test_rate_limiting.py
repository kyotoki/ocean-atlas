from conftest import as_user, client
from rate_limit import limiter


def _create_dive(**overrides):
    payload = {
        "title": "Test Dive",
        "location_name": "Test Reef",
        "latitude": 1.0,
        "longitude": 2.0,
        "max_depth_meters": 15.0,
        "duration_minutes": 30,
        **overrides,
    }
    return client.post("/adventures/", json=payload)


def test_adventure_creation_is_rate_limited_tighter_than_the_global_default():
    # conftest.py disables the limiter globally so the rest of the suite
    # isn't rate-limited by shared TestClient IP - re-enabled just for this
    # test, and reset afterward so it can't leak into any test that runs
    # after this one.
    limiter.enabled = True
    limiter.reset()
    try:
        as_user("rate_limit_test_user")
        statuses = [_create_dive().status_code for _ in range(25)]
        assert 201 in statuses
        assert 429 in statuses, "expected the 20/minute limit on POST /adventures/ to trip"
    finally:
        limiter.reset()
        limiter.enabled = False


def test_upload_is_rate_limited_tighter_than_the_global_default():
    limiter.enabled = True
    limiter.reset()
    try:
        as_user("rate_limit_test_user")
        statuses = []
        for _ in range(15):
            resp = client.post(
                "/uploads/",
                files={"file": ("test.jpg", b"not-a-real-image", "image/jpeg")},
            )
            statuses.append(resp.status_code)
        assert 429 in statuses, "expected the 10/minute limit on POST /uploads/ to trip"
    finally:
        limiter.reset()
        limiter.enabled = False
