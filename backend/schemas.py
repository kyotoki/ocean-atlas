from typing import Optional

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


class AdventureCreate(AdventureBase):
    pass


class Adventure(AdventureBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
