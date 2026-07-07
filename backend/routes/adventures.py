import os
from typing import List
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user_id
from database import get_db
from marine_weather import fetch_marine_conditions
from storage import UPLOAD_ROOT

router = APIRouter(prefix="/adventures", tags=["adventures"])


def _effective_date(adventure: models.Adventure) -> str:
    """The adventure's own date, or its creation date for legacy rows without one."""
    return adventure.date or adventure.created_at.date().isoformat()


@router.get("/", response_model=List[schemas.Adventure])
def list_adventures(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    adventures = (
        db.query(models.Adventure)
        .filter(models.Adventure.user_id == user_id)
        .order_by(models.Adventure.id.desc())
        .all()
    )
    # Sort chronologically by the adventure's own date (Python's sort is
    # stable, so the id-desc order above still breaks ties on the same date).
    adventures.sort(key=_effective_date, reverse=True)
    return adventures


@router.get("/{adventure_id}", response_model=schemas.Adventure)
def get_adventure(
    adventure_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    adventure = db.get(models.Adventure, adventure_id)
    if adventure is None or adventure.user_id != user_id:
        raise HTTPException(status_code=404, detail="Adventure not found")
    return adventure


@router.post("/", response_model=schemas.Adventure, status_code=201)
def create_adventure(
    adventure: schemas.AdventureCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    conditions = fetch_marine_conditions(adventure.latitude, adventure.longitude)
    adventure_data = adventure.model_dump(exclude={"photos"})
    db_adventure = models.Adventure(
        **adventure_data,
        user_id=user_id,
        water_temp_c=conditions["water_temp_c"] if conditions else None,
        wave_height_m=conditions["wave_height_m"] if conditions else None,
        tide_height_m=conditions["tide_height_m"] if conditions else None,
    )
    db_adventure.photos = [
        models.AdventurePhoto(url=url, position=position)
        for position, url in enumerate(adventure.photos)
    ]
    db.add(db_adventure)
    db.commit()
    db.refresh(db_adventure)
    return db_adventure


def _remove_photo_file(url: str) -> None:
    relative_path = urlparse(url).path.removeprefix("/uploads/")
    photo_path = (UPLOAD_ROOT / relative_path).resolve()
    # Confirm the resolved path still lands inside UPLOAD_ROOT before removing
    # anything, since the url is stored data rather than a value we can fully
    # trust to be a clean relative path. Missing files are skipped quietly
    # rather than raising, since the file may already be gone.
    if photo_path.is_relative_to(UPLOAD_ROOT.resolve()) and photo_path.is_file():
        os.remove(photo_path)


@router.delete("/{adventure_id}", status_code=204)
def delete_adventure(
    adventure_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    adventure = db.get(models.Adventure, adventure_id)
    if adventure is None or adventure.user_id != user_id:
        raise HTTPException(status_code=404, detail="Adventure not found")

    for photo in adventure.photos:
        _remove_photo_file(photo.url)

    db.delete(adventure)
    db.commit()
    return None
