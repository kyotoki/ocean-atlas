from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from database import Base


class Adventure(Base):
    __tablename__ = "adventures"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    # The date the adventure took place (YYYY-MM-DD, user-selected) - distinct
    # from created_at, which is when the record was inserted. Nullable so
    # legacy rows predating this column don't break; the API layer falls back
    # to created_at for those.
    date = Column(String, nullable=True)
    # `default` (evaluated in Python at INSERT time) covers rows on databases
    # migrated via ALTER TABLE, where SQLite's ALTER syntax can't attach a
    # CURRENT_TIMESTAMP default to the column; `server_default` handles inserts
    # from outside the ORM on freshly created tables.
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), server_default=func.now()
    )
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    max_depth_meters = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    # Superseded by the `photos` relationship below (one adventure can now
    # have many photos) - left in place, unused, so existing SQLite files
    # don't need a destructive column drop. The migration backfills any
    # legacy value here into a single `adventure_photos` row instead.
    photo_url = Column(String, nullable=True)
    water_temp_c = Column(Float, nullable=True)
    wave_height_m = Column(Float, nullable=True)
    tide_height_m = Column(Float, nullable=True)
    activity_type = Column(String, nullable=False, default="scuba", server_default="scuba")
    tank_pressure_bar = Column(Float, nullable=True)
    gas_mix = Column(String, nullable=True)

    photos = relationship(
        "AdventurePhoto",
        order_by="AdventurePhoto.position",
        cascade="all, delete-orphan",
    )


class AdventurePhoto(Base):
    __tablename__ = "adventure_photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    adventure_id = Column(Integer, ForeignKey("adventures.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String, nullable=False)
    position = Column(Integer, nullable=False, default=0)


class UserProfile(Base):
    """One-time onboarding profile fields, keyed by Clerk user id.

    Absence of a row for a given user_id is the signal that they haven't
    completed onboarding yet (see routes/profile.py).
    """

    __tablename__ = "user_profiles"

    user_id = Column(String, primary_key=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    nickname = Column(String, nullable=True)
    country_code = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), server_default=func.now()
    )
