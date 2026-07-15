FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
# python:3.12-slim ships an old pip/setuptools with known CVEs (PYSEC-2026-*) -
# upgrading both before installing app deps means the build tooling baked
# into the image is patched too, not just the packages requirements.txt lists.
RUN pip install --no-cache-dir --upgrade pip setuptools && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Railway assigns its own $PORT per service and health-checks that port
# directly - a hardcoded port here would work in Docker Compose (where
# nothing else is listening for a specific port) but silently fail Railway's
# health check. Shell form (not exec-array form) so $PORT actually expands;
# ${PORT:-8000} keeps `docker compose up` working unchanged since Compose
# never sets PORT.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
