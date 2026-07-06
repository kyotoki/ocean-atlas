from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user_id
from database import get_db

router = APIRouter(prefix="/adventures", tags=["adventures"])


@router.get("/", response_model=List[schemas.Adventure])
def list_adventures(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return (
        db.query(models.Adventure)
        .filter(models.Adventure.user_id == user_id)
        .order_by(models.Adventure.id.desc())
        .all()
    )


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
    db_adventure = models.Adventure(**adventure.model_dump(), user_id=user_id)
    db.add(db_adventure)
    db.commit()
    db.refresh(db_adventure)
    return db_adventure


@router.delete("/{adventure_id}", status_code=204)
def delete_adventure(
    adventure_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    adventure = db.get(models.Adventure, adventure_id)
    if adventure is None or adventure.user_id != user_id:
        raise HTTPException(status_code=404, detail="Adventure not found")
    db.delete(adventure)
    db.commit()
    return None
