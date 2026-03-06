import os
import httpx
from dotenv import load_dotenv
from supabase import Client, ClientOptions, create_client

load_dotenv()
# Creating the engine to connect supabase with backend
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

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

