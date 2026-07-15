import logging

import sentry_sdk
from clerk_backend_api import Clerk
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
from auth import CLERK_SECRET_KEY, get_current_user_id
from database import get_db
from storage import delete_photo

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/account", tags=["account"])


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Irreversibly delete the authenticated user's account and every row
    they own, then delete the underlying Clerk account itself.

    Order matters: all local data is deleted and committed FIRST, the Clerk
    account is deleted LAST. If the Clerk call fails after that commit, the
    user is left with no data under a still-live Clerk account (an easy,
    safe state to retry from - the local side is already clean, and Sentry
    gets the failure for follow-up). The reverse order is worse: if Clerk
    deletion succeeded but local cleanup then failed partway, the user could
    no longer authenticate to retry, permanently orphaning whatever local
    data was left.

    ContentReport rows where this user is the reporter are anonymized (their
    reporter_user_id set to None), not deleted - the report is a safety
    record about the reported content, independent of who filed it, so it
    survives the reporter deleting their account with the reported content
    reference and moderation state untouched.
    """
    photo_urls = [
        row.photo_url
        for row in db.query(models.PhotoModeration).filter_by(user_id=user_id).all()
    ]

    adventures = db.query(models.Adventure).filter_by(user_id=user_id).all()
    for adventure in adventures:
        # Deleting via the loaded ORM object (not a bulk query) so the
        # `cascade="all, delete-orphan"` relationships on Adventure.photos/
        # .species actually fire - the DB-level ondelete="CASCADE" FK alone
        # isn't enough here, since SQLite (used locally/in tests) doesn't
        # enforce FK constraints unless PRAGMA foreign_keys=ON is set, unlike
        # Postgres (production/staging), which would enforce it either way.
        db.delete(adventure)

    db.query(models.PhotoModeration).filter_by(user_id=user_id).delete()
    db.query(models.ContentReport).filter_by(reporter_user_id=user_id).update(
        {"reporter_user_id": None}
    )

    profile = db.get(models.UserProfile, user_id)
    if profile is not None:
        db.delete(profile)

    db.commit()

    # Best-effort, same as delete_adventure's existing per-photo cleanup -
    # covers uploads never attached to any adventure (PhotoModeration's own
    # docstring: a row here doesn't imply an AdventurePhoto row exists),
    # which iterating adventures[].photos alone would miss.
    for url in photo_urls:
        delete_photo(url)

    if not CLERK_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="CLERK_SECRET_KEY is not configured on the server.",
        )

    try:
        Clerk(bearer_auth=CLERK_SECRET_KEY).users.delete(user_id=user_id)
    except Exception:
        logger.exception(
            "Local data deleted but Clerk account deletion failed",
            extra={"user_id": user_id},
        )
        sentry_sdk.capture_exception()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Your data was deleted, but we couldn't remove your account credentials. "
                "Please contact support."
            ),
        )

    return None
