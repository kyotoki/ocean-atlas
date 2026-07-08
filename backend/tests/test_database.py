"""database.py builds its engine from DATABASE_URL at import time, so each
scenario here imports it fresh in an isolated subprocess rather than
reloading the module in-process - reloading would leave the shared test
session's Base/engine (already bound into models.py and conftest.py at
collection time) in an inconsistent state.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent

CHECK_SCRIPT = """
import json
import threading
import database

result = {
    "url": str(database.engine.url),
    "pool_pre_ping": database.engine.pool._pre_ping,
    "dialect": database.engine.dialect.name,
}

if result["dialect"] == "sqlite":
    # check_same_thread=False is the whole point for SQLite here (the app
    # serves requests from a thread pool); reusing one connection from a
    # second thread raises sqlite3.ProgrammingError if that flag is left at
    # its default True.
    conn = database.engine.connect()
    errors = []

    def use_from_other_thread():
        try:
            conn.exec_driver_sql("SELECT 1")
        except Exception as exc:  # noqa: BLE001
            errors.append(str(exc))

    thread = threading.Thread(target=use_from_other_thread)
    thread.start()
    thread.join()
    conn.close()
    result["cross_thread_ok"] = not errors

print(json.dumps(result))
"""


def run_with_database_url(database_url):
    env = os.environ.copy()
    if database_url is None:
        env.pop("DATABASE_URL", None)
    else:
        env["DATABASE_URL"] = database_url

    result = subprocess.run(
        [sys.executable, "-c", CHECK_SCRIPT],
        cwd=str(BACKEND_DIR),
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def test_falls_back_to_sqlite_when_database_url_is_unset():
    info = run_with_database_url(None)
    assert info["dialect"] == "sqlite"
    assert "svel.db" in info["url"]


def test_sqlite_connections_allow_cross_thread_reuse():
    assert run_with_database_url(None)["cross_thread_ok"] is True


def test_pool_pre_ping_is_always_enabled():
    assert run_with_database_url(None)["pool_pre_ping"] is True
    assert run_with_database_url("postgresql://svel:svel@localhost:5432/svel")["pool_pre_ping"] is True


def test_normalizes_postgres_scheme_to_postgresql():
    info = run_with_database_url("postgres://svel:svel@localhost:5432/svel")
    assert info["dialect"] == "postgresql"
    assert info["url"].startswith("postgresql://")


def test_leaves_already_normalized_postgresql_url_unchanged():
    info = run_with_database_url("postgresql://svel:svel@localhost:5432/svel")
    assert info["dialect"] == "postgresql"


def test_custom_sqlite_path_is_still_recognized_as_sqlite(tmp_path):
    db_path = tmp_path / "custom.db"
    info = run_with_database_url(f"sqlite:///{db_path}")
    assert info["dialect"] == "sqlite"
    assert "custom.db" in info["url"]
