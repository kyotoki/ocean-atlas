from unittest import mock

import httpx

import marine_weather
import routes.adventures as adventures_module
from conftest import as_user, client


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


def test_new_adventure_is_enriched_with_marine_conditions():
    as_user("user_a")
    resp = create_dive()
    assert resp.status_code == 201
    body = resp.json()
    assert body["water_temp_c"] == 24.5
    assert body["wave_height_m"] == 0.8
    assert body["tide_height_m"] == 0.3


def test_marine_conditions_lookup_uses_the_adventures_coordinates():
    with mock.patch.object(adventures_module, "fetch_marine_conditions", return_value=None) as fake_fetch:
        as_user("user_a")
        create_dive(latitude=12.34, longitude=56.78)
        fake_fetch.assert_called_once_with(12.34, 56.78)


def test_adventure_creation_succeeds_when_marine_api_is_unavailable():
    with mock.patch.object(adventures_module, "fetch_marine_conditions", return_value=None):
        as_user("user_a")
        resp = create_dive()
        assert resp.status_code == 201
        body = resp.json()
        assert body["water_temp_c"] is None
        assert body["wave_height_m"] is None
        assert body["tide_height_m"] is None


class _FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        pass

    def json(self):
        return self._payload


def test_fetch_marine_conditions_parses_the_current_block():
    fake_response = _FakeResponse(
        {
            "current": {
                "sea_surface_temperature": 25.1,
                "wave_height": 0.9,
                "sea_level_height_msl": 0.4,
            }
        }
    )

    with mock.patch.object(marine_weather.httpx, "get", return_value=fake_response) as mock_get:
        result = marine_weather.fetch_marine_conditions(1.0, 2.0)

    mock_get.assert_called_once()
    assert result == {
        "water_temp_c": 25.1,
        "wave_height_m": 0.9,
        "tide_height_m": 0.4,
    }


def test_fetch_marine_conditions_returns_none_on_network_error():
    with mock.patch.object(marine_weather.httpx, "get", side_effect=httpx.ConnectError("boom")):
        assert marine_weather.fetch_marine_conditions(1.0, 2.0) is None


def test_fetch_marine_conditions_returns_none_on_malformed_response():
    response = _FakeResponse(None)
    response.json = mock.Mock(side_effect=ValueError("invalid json"))

    with mock.patch.object(marine_weather.httpx, "get", return_value=response):
        assert marine_weather.fetch_marine_conditions(1.0, 2.0) is None


def test_fetch_marine_conditions_uses_the_customer_endpoint_when_api_key_is_configured():
    fake_response = _FakeResponse({"current": {}})

    with mock.patch.object(marine_weather, "OPEN_METEO_API_KEY", "test-key-123"), mock.patch.object(
        marine_weather.httpx, "get", return_value=fake_response
    ) as mock_get:
        marine_weather.fetch_marine_conditions(1.0, 2.0)

    called_url, called_kwargs = mock_get.call_args[0][0], mock_get.call_args[1]
    assert called_url == marine_weather.CUSTOMER_MARINE_API_URL
    assert called_kwargs["params"]["apikey"] == "test-key-123"


def test_fetch_marine_conditions_uses_the_free_endpoint_when_no_api_key_is_configured():
    fake_response = _FakeResponse({"current": {}})

    with mock.patch.object(marine_weather, "OPEN_METEO_API_KEY", None), mock.patch.object(
        marine_weather.httpx, "get", return_value=fake_response
    ) as mock_get:
        marine_weather.fetch_marine_conditions(1.0, 2.0)

    called_url, called_kwargs = mock_get.call_args[0][0], mock_get.call_args[1]
    assert called_url == marine_weather.FREE_MARINE_API_URL
    assert "apikey" not in called_kwargs["params"]
