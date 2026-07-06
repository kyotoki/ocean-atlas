from sqlalchemy import Column, Float, Integer, String, Text

from database import Base


class Adventure(Base):
    __tablename__ = "adventures"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    max_depth_meters = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    water_temp_c = Column(Float, nullable=True)
    wave_height_m = Column(Float, nullable=True)
    tide_height_m = Column(Float, nullable=True)
    activity_type = Column(String, nullable=False, default="scuba", server_default="scuba")
    tank_pressure_bar = Column(Float, nullable=True)
    gas_mix = Column(String, nullable=True)
