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
