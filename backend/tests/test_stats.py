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


def test_stats_for_user_with_no_dives():
    as_user("user_a")
    resp = client.get("/stats/")
    assert resp.status_code == 200
    assert resp.json() == {
        "total_dives": 0,
        "deepest_dive_meters": None,
        "total_minutes_underwater": 0,
        "countries_visited": 0,
        "favorite_site": None,
    }


def test_stats_aggregate_across_dives():
    as_user("user_a")
    create_dive(location_name="Reef A", max_depth_meters=18.0, duration_minutes=40)
    create_dive(location_name="Reef B", max_depth_meters=32.5, duration_minutes=55)
    create_dive(location_name="Reef C", max_depth_meters=10.0, duration_minutes=25)

    resp = client.get("/stats/")
    assert resp.status_code == 200
    assert resp.json() == {
        "total_dives": 3,
        "deepest_dive_meters": 32.5,
        "total_minutes_underwater": 120,
        "countries_visited": 3,
        # All three are logged once each - a three-way tie, broken alphabetically.
        "favorite_site": "Reef A",
    }


def test_stats_only_include_the_current_users_dives():
    as_user("user_a")
    create_dive(max_depth_meters=50.0, duration_minutes=60)

    as_user("user_b")
    create_dive(max_depth_meters=5.0, duration_minutes=10)

    resp = client.get("/stats/")
    assert resp.json() == {
        "total_dives": 1,
        "deepest_dive_meters": 5.0,
        "total_minutes_underwater": 10,
        "countries_visited": 1,
        "favorite_site": "Test Reef",
    }

    as_user("user_a")
    resp = client.get("/stats/")
    assert resp.json() == {
        "total_dives": 1,
        "deepest_dive_meters": 50.0,
        "total_minutes_underwater": 60,
        "countries_visited": 1,
        "favorite_site": "Test Reef",
    }


def test_countries_visited_counts_distinct_location_names():
    as_user("user_a")
    create_dive(location_name="Blue Hole")
    create_dive(location_name="Blue Hole")
    create_dive(location_name="Coral Garden")

    resp = client.get("/stats/")
    assert resp.json()["countries_visited"] == 2


def test_favorite_site_is_the_most_frequently_logged_location():
    as_user("user_a")
    create_dive(location_name="Blue Hole")
    create_dive(location_name="Blue Hole")
    create_dive(location_name="Blue Hole")
    create_dive(location_name="Coral Garden")

    resp = client.get("/stats/")
    assert resp.json()["favorite_site"] == "Blue Hole"


def test_favorite_site_breaks_ties_alphabetically():
    as_user("user_a")
    create_dive(location_name="Zebra Reef")
    create_dive(location_name="Alpha Reef")

    resp = client.get("/stats/")
    assert resp.json()["favorite_site"] == "Alpha Reef"


def test_stats_requires_authentication():
    remove_auth_override()
    try:
        resp = client.get("/stats/")
        assert resp.status_code in (401, 403)
    finally:
        restore_auth_override()
