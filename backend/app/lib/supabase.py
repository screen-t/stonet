import base64
import json
import os
import httpx
from dotenv import load_dotenv
from supabase import Client, ClientOptions, create_client

load_dotenv()
# Creating the engine to connect supabase with backend
SUPABASE_URL = os.getenv("SUPABASE_URL")
# Backward-compatible lookup: old docs used SUPABASE_SERVICE_KEY.
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL:
    raise RuntimeError("Missing SUPABASE_URL environment variable")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing service role key. Set SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_SERVICE_KEY.")


def _decode_jwt_payload(token: str) -> dict:
    """Decode JWT payload without verification for startup sanity checks."""
    try:
        payload_segment = token.split(".")[1]
        padding = "=" * (-len(payload_segment) % 4)
        decoded = base64.urlsafe_b64decode(payload_segment + padding)
        return json.loads(decoded.decode("utf-8"))
    except Exception:
        return {}


role = _decode_jwt_payload(SUPABASE_SERVICE_ROLE_KEY).get("role")
if role and role != "service_role":
    raise RuntimeError(
        f"Configured Supabase key role is '{role}', expected 'service_role'. "
        "Check backend env var SUPABASE_SERVICE_ROLE_KEY."
    )

# Force HTTP/1.1 to avoid Windows HTTP/2 GOAWAY frame issues (error_code:0)
# Windows sends GOAWAY on idle connections, which httpcore treats as fatal unless we use HTTP/1.1
client_options = ClientOptions(
    postgrest_client_timeout=30,
)

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    options=client_options
)

# Replace auth client's httpx session with HTTP/1.1 to avoid connection drops
# (supabase-auth hard-codes http2=True for GoTrue client)
try:
    if hasattr(supabase.auth, '_http_client') and supabase.auth._http_client:
        # Create HTTP/1.1 client with same settings as original
        supabase.auth._http_client = httpx.Client(
            http2=False,
            timeout=30.0,
        )
except Exception:
    pass  # If manipulation fails, continue with default (will still have HTTP/1.1 postgrest via ClientOptions)
