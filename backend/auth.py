import os

from clerk_backend_api.security.authenticaterequest import authenticate_request
from clerk_backend_api.security.types import AuthenticateRequestOptions
from dotenv import load_dotenv
from fastapi import HTTPException, Request, status

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")


def get_current_user_id(request: Request) -> str:
    if not CLERK_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="CLERK_SECRET_KEY is not configured on the server.",
        )

    request_state = authenticate_request(
        request,
        AuthenticateRequestOptions(
            secret_key=CLERK_SECRET_KEY,
            accepts_token=["session_token"],
        ),
    )

    user_id = request_state.payload.get("sub") if request_state.payload else None
    if not request_state.is_signed_in or not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )

    return user_id
