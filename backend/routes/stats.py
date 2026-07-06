from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user_id
from database import get_db

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/", response_model=schemas.DiveStats)
def get_dive_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    total_dives, deepest_dive_meters, total_minutes_underwater, countries_visited = (
        db.query(
            func.count(models.Adventure.id),
            func.max(models.Adventure.max_depth_meters),
            func.coalesce(func.sum(models.Adventure.duration_minutes), 0),
            # We don't store an actual geocoded country - "countries visited" is
            # a count of distinct logged location names, per how this stat was
            # specified (a practical proxy, not a verified political country).
            func.count(func.distinct(models.Adventure.location_name)),
        )
        .filter(models.Adventure.user_id == user_id)
        .one()
    )

    favorite_site_row = (
        db.query(models.Adventure.location_name)
        .filter(models.Adventure.user_id == user_id)
        .group_by(models.Adventure.location_name)
        .order_by(func.count().desc(), models.Adventure.location_name.asc())
        .first()
    )
    favorite_site = favorite_site_row[0] if favorite_site_row else None

    return schemas.DiveStats(
        total_dives=total_dives,
        deepest_dive_meters=deepest_dive_meters,
        total_minutes_underwater=total_minutes_underwater,
        countries_visited=countries_visited,
        favorite_site=favorite_site,
    )


@router.get("/by-activity", response_model=schemas.ActivityStats)
def get_activity_stats(
    activity_type: Literal["scuba", "snorkeling"] = Query(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    scope = (
        models.Adventure.user_id == user_id,
        models.Adventure.activity_type == activity_type,
    )

    total_trips, total_minutes, deepest_meters, average_bottom_time_minutes = (
        db.query(
            func.count(models.Adventure.id),
            func.coalesce(func.sum(models.Adventure.duration_minutes), 0),
            func.max(models.Adventure.max_depth_meters),
            func.avg(models.Adventure.duration_minutes),
        )
        .filter(*scope)
        .one()
    )

    favorite_site_row = (
        db.query(models.Adventure.location_name)
        .filter(*scope)
        .group_by(models.Adventure.location_name)
        .order_by(func.count().desc(), models.Adventure.location_name.asc())
        .first()
    )
    favorite_site = favorite_site_row[0] if favorite_site_row else None

    return schemas.ActivityStats(
        activity_type=activity_type,
        total_trips=total_trips,
        total_minutes=total_minutes,
        deepest_meters=deepest_meters,
        average_bottom_time_minutes=average_bottom_time_minutes,
        favorite_site=favorite_site,
    )
