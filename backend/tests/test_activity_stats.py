from conftest import as_user, client, remove_auth_override, restore_auth_override


def create_dive(**overrides):
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


def test_new_adventure_defaults_to_scuba_when_activity_type_is_omitted():
    as_user("user_a")
    resp = create_dive()
    assert resp.status_code == 201
    assert resp.json()["activity_type"] == "scuba"


def test_adventure_can_be_logged_as_snorkeling():
    as_user("user_a")
    resp = create_dive(activity_type="snorkeling")
    assert resp.status_code == 201
    assert resp.json()["activity_type"] == "snorkeling"


def test_invalid_activity_type_is_rejected():
    as_user("user_a")
    resp = create_dive(activity_type="surfing")
    assert resp.status_code == 422


def test_scuba_specific_fields_are_persisted():
    as_user("user_a")
    resp = create_dive(activity_type="scuba", tank_pressure_bar=200.0, gas_mix="Nitrox 32")
    assert resp.status_code == 201
    body = resp.json()
    assert body["tank_pressure_bar"] == 200.0
    assert body["gas_mix"] == "Nitrox 32"


def test_activity_stats_for_user_with_no_trips_of_that_type():
    as_user("user_a")
    resp = client.get("/stats/by-activity", params={"activity_type": "snorkeling"})
    assert resp.status_code == 200
    assert resp.json() == {
        "activity_type": "snorkeling",
        "total_trips": 0,
        "total_minutes": 0,
        "deepest_meters": None,
        "average_bottom_time_minutes": None,
        "favorite_site": None,
    }


def test_activity_stats_only_aggregate_matching_activity_type():
    as_user("user_a")
    create_dive(activity_type="scuba", max_depth_meters=30.0, duration_minutes=40)
    create_dive(activity_type="scuba", max_depth_meters=18.0, duration_minutes=20)
    create_dive(activity_type="snorkeling", location_name="Shallow Bay", max_depth_meters=4.0, duration_minutes=60)

    scuba_resp = client.get("/stats/by-activity", params={"activity_type": "scuba"})
    assert scuba_resp.json() == {
        "activity_type": "scuba",
        "total_trips": 2,
        "total_minutes": 60,
        "deepest_meters": 30.0,
        "average_bottom_time_minutes": 30.0,
        "favorite_site": "Test Reef",
    }

    snorkel_resp = client.get("/stats/by-activity", params={"activity_type": "snorkeling"})
    assert snorkel_resp.json() == {
        "activity_type": "snorkeling",
        "total_trips": 1,
        "total_minutes": 60,
        "deepest_meters": 4.0,
        "average_bottom_time_minutes": 60.0,
        "favorite_site": "Shallow Bay",
    }


def test_activity_stats_only_include_the_current_users_trips():
    as_user("user_a")
    create_dive(activity_type="scuba")

    as_user("user_b")
    create_dive(activity_type="scuba", duration_minutes=99)

    resp = client.get("/stats/by-activity", params={"activity_type": "scuba"})
    assert resp.json()["total_trips"] == 1
    assert resp.json()["total_minutes"] == 99


def test_activity_stats_requires_authentication():
    remove_auth_override()
    try:
        resp = client.get("/stats/by-activity", params={"activity_type": "scuba"})
        assert resp.status_code in (401, 403)
    finally:
        restore_auth_override()


def test_activity_stats_requires_a_valid_activity_type_param():
    as_user("user_a")
    resp = client.get("/stats/by-activity", params={"activity_type": "surfing"})
    assert resp.status_code == 422
