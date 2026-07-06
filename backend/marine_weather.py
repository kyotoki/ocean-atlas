import logging
import os
from typing import Optional, TypedDict

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Open-Meteo's free tier (used by default) needs no credential at all. They also
# offer a paid "customer" tier for higher rate limits/reliability, served from a
# different host and gated behind an API key. Read that key from the
# environment (populated from .env via load_dotenv above) rather than ever
# hardcoding one - if OPEN_METEO_API_KEY isn't set, we transparently fall back
# to the free public endpoint, so this has no effect until someone opts in.
FREE_MARINE_API_URL = "https://marine-api.open-meteo.com/v1/marine"
CUSTOMER_MARINE_API_URL = "https://customer-marine-api.open-meteo.com/v1/marine"
OPEN_METEO_API_KEY = os.getenv("OPEN_METEO_API_KEY")
REQUEST_TIMEOUT_SECONDS = 5.0


class MarineConditions(TypedDict):
    water_temp_c: Optional[float]
    wave_height_m: Optional[float]
    tide_height_m: Optional[float]


def fetch_marine_conditions(latitude: float, longitude: float) -> Optional[MarineConditions]:
    """Fetch current sea conditions for a dive location from Open-Meteo's Marine API.

    Returns None on any failure - marine conditions are an enrichment on an
    adventure, not a hard requirement, so a slow or unavailable upstream API must
    never block saving a dive.
    """
    url = FREE_MARINE_API_URL
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "wave_height,sea_surface_temperature,sea_level_height_msl",
    }
    if OPEN_METEO_API_KEY:
        url = CUSTOMER_MARINE_API_URL
        params["apikey"] = OPEN_METEO_API_KEY

    try:
        response = httpx.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        current = response.json().get("current", {})
    except (httpx.HTTPError, ValueError):
        logger.warning(
            "Unable to fetch marine conditions for (%s, %s)", latitude, longitude, exc_info=True
        )
        return None

    return {
        "water_temp_c": current.get("sea_surface_temperature"),
        "wave_height_m": current.get("wave_height"),
        "tide_height_m": current.get("sea_level_height_msl"),
    }
