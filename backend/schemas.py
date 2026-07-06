from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class AdventureBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    location_name: str = Field(..., min_length=1, max_length=200)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    max_depth_meters: float = Field(..., ge=0)
    duration_minutes: int = Field(..., ge=0)
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    activity_type: Literal["scuba", "snorkeling"] = "scuba"
    tank_pressure_bar: Optional[float] = Field(None, ge=0)
    gas_mix: Optional[str] = Field(None, max_length=50)


class AdventureCreate(AdventureBase):
    pass


class Adventure(AdventureBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    water_temp_c: Optional[float] = None
    wave_height_m: Optional[float] = None
    tide_height_m: Optional[float] = None


class DiveStats(BaseModel):
    total_dives: int
    deepest_dive_meters: Optional[float] = None
    total_minutes_underwater: int
    countries_visited: int
    favorite_site: Optional[str] = None


class ActivityStats(BaseModel):
    activity_type: Literal["scuba", "snorkeling"]
    total_trips: int
    total_minutes: int
    deepest_meters: Optional[float] = None
    average_bottom_time_minutes: Optional[float] = None
    favorite_site: Optional[str] = None
