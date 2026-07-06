from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./ocean_atlas.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations():
    """Add columns introduced after the initial create_all to existing SQLite files.

    create_all only creates missing tables, not missing columns on tables that
    already exist, so schema additions need an explicit, idempotent ALTER here.
    """
    with engine.connect() as conn:
        existing_columns = {
            row[1] for row in conn.exec_driver_sql("PRAGMA table_info(adventures)")
        }
        if existing_columns and "photo_url" not in existing_columns:
            conn.exec_driver_sql("ALTER TABLE adventures ADD COLUMN photo_url TEXT")
            conn.commit()
        for column in ("water_temp_c", "wave_height_m", "tide_height_m"):
            if existing_columns and column not in existing_columns:
                conn.exec_driver_sql(f"ALTER TABLE adventures ADD COLUMN {column} REAL")
                conn.commit()
        if existing_columns and "activity_type" not in existing_columns:
            # NOT NULL + a constant DEFAULT means existing rows are backfilled
            # to 'scuba' automatically by SQLite as part of the ALTER itself.
            conn.exec_driver_sql(
                "ALTER TABLE adventures ADD COLUMN activity_type TEXT NOT NULL DEFAULT 'scuba'"
            )
            conn.commit()
        if existing_columns and "tank_pressure_bar" not in existing_columns:
            conn.exec_driver_sql("ALTER TABLE adventures ADD COLUMN tank_pressure_bar REAL")
            conn.commit()
        if existing_columns and "gas_mix" not in existing_columns:
            conn.exec_driver_sql("ALTER TABLE adventures ADD COLUMN gas_mix TEXT")
            conn.commit()
