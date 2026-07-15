from conftest import as_user, client, remove_auth_override, restore_auth_override


def upsert_profile(**overrides):
    payload = {
        "first_name": "Ada",
        "last_name": "Diver",
        "nickname": None,
        "country_code": None,
        "photo_url": None,
        **overrides,
    }
    return client.put("/profile/me", json=payload)


def test_missing_profile_returns_404_not_someone_elses():
    as_user("user_a")
    resp = client.get("/profile/me")
    assert resp.status_code == 404


def test_created_profile_is_tagged_with_the_authenticated_user():
    as_user("user_a")
    resp = upsert_profile(first_name="A")
    assert resp.status_code == 200
    assert resp.json()["user_id"] == "user_a"


def test_cannot_read_another_users_profile():
    as_user("user_a")
    upsert_profile(first_name="A")

    as_user("user_b")
    resp = client.get("/profile/me")
    assert resp.status_code == 404


def test_put_always_targets_the_authenticated_user_even_if_a_user_id_is_smuggled_in():
    as_user("user_a")
    upsert_profile(first_name="A-original")

    as_user("user_b")
    # UserProfileCreate has no user_id field at all, so this extra key is
    # silently ignored by pydantic rather than doing anything - this test
    # exists to lock that in, not because the field is currently accepted.
    resp = client.put("/profile/me", json={
        "first_name": "B",
        "last_name": "Diver",
        "user_id": "user_a",
    })
    assert resp.status_code == 200
    assert resp.json()["user_id"] == "user_b"

    as_user("user_a")
    resp = client.get("/profile/me")
    assert resp.json()["first_name"] == "A-original"


def test_put_updates_only_the_authenticated_users_own_profile():
    as_user("user_a")
    upsert_profile(first_name="A-original")
    as_user("user_b")
    upsert_profile(first_name="B-original")

    as_user("user_a")
    upsert_profile(first_name="A-updated")

    as_user("user_b")
    resp = client.get("/profile/me")
    assert resp.json()["first_name"] == "B-original"

    as_user("user_a")
    resp = client.get("/profile/me")
    assert resp.json()["first_name"] == "A-updated"


def test_unauthenticated_requests_are_rejected():
    remove_auth_override()
    try:
        resp = client.get("/profile/me")
        assert resp.status_code in (401, 403)
        resp = client.put("/profile/me", json={"first_name": "X", "last_name": "Y"})
        assert resp.status_code in (401, 403)
    finally:
        restore_auth_override()
