// Thrown only when a request actually reached the server and the server
// responded with a real rejection (bad status, validation error, auth
// failure). Any other thrown error (fetch itself throwing, a timeout, a
// Clerk token refresh failure) is assumed to be a connectivity problem -
// that distinction is what decides whether a failed adventure submission
// should be queued for offline retry or shown as a real, non-retryable error.
export class ServerRejectedError extends Error {}
