import os

from slowapi import Limiter
from slowapi.util import get_remote_address

# A separate module (not defined in main.py) specifically so route files can
# import `limiter` for per-route @limiter.limit(...) overrides without a
# circular import - main.py imports the route modules, so the reverse import
# would fail.
limiter = Limiter(key_func=get_remote_address, default_limits=[os.getenv("RATE_LIMIT_DEFAULT", "120/minute")])
