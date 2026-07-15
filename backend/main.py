import logging
import os

from dotenv import load_dotenv

load_dotenv()

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

import models
from database import engine, run_migrations
from logging_config import configure_logging
from rate_limit import limiter
from routes import account, adventures, profile, reports, species, stats, uploads
from storage import UPLOAD_ROOT

configure_logging()
logger = logging.getLogger(__name__)

# A missing/empty SENTRY_DSN is a documented no-op for sentry_sdk.init() -
# every event call becomes a silent discard rather than an error, so local
# dev (no DSN set) keeps working exactly as before, with just the local JSON
# logging from configure_logging() above. Environment is tagged (not a
# separate Sentry project per environment) so staging/production errors
# share one dashboard, filterable/alertable by environment.
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("SENTRY_ENVIRONMENT"),
    send_default_pii=False,
)

models.Base.metadata.create_all(bind=engine)
run_migrations()
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Svel API", version="1.0.0")

# Local Expo dev origins by default; the real svel.app origin is added purely
# via this env var in Month 4, with no code change.
DEFAULT_ALLOWED_ORIGINS = "http://localhost:8081,http://localhost:19006"
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


@app.middleware("http")
async def add_hsts_header(request: Request, call_next):
    response = await call_next(request)
    # Railway terminates TLS and forwards to this container over plain HTTP,
    # so request.url.scheme is always "http" here regardless of what the
    # client actually used - X-Forwarded-Proto is the proxy's record of the
    # original scheme. Gated on it (rather than set unconditionally) so this
    # never fires against local dev (http://localhost), where it would be
    # actively harmful: once a browser sees this header it refuses to use
    # HTTP for that host again for the full max-age, with no easy undo.
    if request.headers.get("x-forwarded-proto") == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.exception_handler(Exception)
async def log_unhandled_exceptions(request: Request, exc: Exception):
    logger.exception(
        "Unhandled exception while processing request",
        extra={"path": request.url.path, "method": request.method},
    )
    # This handler converts the exception into a clean 500 JSONResponse
    # before it ever reaches Starlette's own exception middleware, which is
    # where Sentry's FastAPI auto-instrumentation normally hooks in - so
    # without this explicit call, every error caught here would be invisible
    # to Sentry despite still being a real unhandled exception. A no-op when
    # SENTRY_DSN is unset, same as sentry_sdk.init() above.
    sentry_sdk.capture_exception(exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(account.router)
app.include_router(adventures.router)
app.include_router(profile.router)
app.include_router(reports.router)
app.include_router(species.router)
app.include_router(stats.router)
app.include_router(uploads.router)
# Registered after the uploads router: Starlette matches routes in
# registration order, and a Mount matches on path prefix alone (regardless of
# HTTP method), so mounting this first would shadow POST /uploads/ with a 405
# before it ever reached the router.
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")


@app.get("/")
def read_root():
    return {"status": "ok", "service": "Svel API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
