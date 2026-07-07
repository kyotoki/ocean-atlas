from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user_id
from database import get_db

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=schemas.UserProfile)
def get_my_profile(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    # A missing row is the signal the frontend uses to route a user into the
    # one-time onboarding flow, so a 404 here is an expected, normal response
    # rather than an error condition.
    profile = db.get(models.UserProfile, user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/me", response_model=schemas.UserProfile)
def upsert_my_profile(
    profile: schemas.UserProfileCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    db_profile = db.get(models.UserProfile, user_id)
    if db_profile is None:
        db_profile = models.UserProfile(user_id=user_id, **profile.model_dump())
        db.add(db_profile)
    else:
        for field, value in profile.model_dump().items():
            setattr(db_profile, field, value)
    db.commit()
    db.refresh(db_profile)
    return db_profile
