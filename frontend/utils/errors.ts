// Thrown only when a request actually reached the server and the server
// responded with a real rejection (bad status, validation error, auth
// failure). Any other thrown error (fetch itself throwing, a timeout, a
// Clerk token refresh failure) is assumed to be a connectivity problem -
// that distinction is what decides whether a failed adventure submission
// should be queued for offline retry or shown as a real, non-retryable error.
//
// Carries the response's HTTP status (when known) so callers can special-
// case specific failures - e.g. 401/403 meaning the session itself needs
// re-authentication, not just "the server didn't like this request."
export class ServerRejectedError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ServerRejectedError";
    this.status = status;
  }
}

// 401 (unauthenticated) or 403 (forbidden) mean retrying the same request
// unchanged will never succeed until the user signs in again - distinct from
// any other rejection (validation, payload too large, etc.) where the
// server's own message is the useful thing to show.
export function isAuthError(error: ServerRejectedError): boolean {
  return error.status === 401 || error.status === 403;
}

export const REAUTH_MESSAGE =
  "Your session has expired. Please sign out and sign back in, then try again.";

// Thrown when the offline sync queue is already at MAX_QUEUE_SIZE - the new
// adventure is not saved, and the caller must tell the user directly rather
// than silently losing it (see adventureQueue.ts).
export class QueueFullError extends Error {}
