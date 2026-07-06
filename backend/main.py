from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models
from database import engine, run_migrations
from routes import adventures, stats, uploads
from storage import UPLOAD_ROOT

models.Base.metadata.create_all(bind=engine)
run_migrations()
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Ocean Atlas API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(adventures.router)
app.include_router(stats.router)
app.include_router(uploads.router)
# Registered after the uploads router: Starlette matches routes in
# registration order, and a Mount matches on path prefix alone (regardless of
# HTTP method), so mounting this first would shadow POST /uploads/ with a 405
# before it ever reached the router.
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")


@app.get("/")
def read_root():
    return {"status": "ok", "service": "Ocean Atlas API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
