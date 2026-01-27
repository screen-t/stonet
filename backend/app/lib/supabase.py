import os
from dotenv import load_dotenv
from supabase import create_client, Client
load_dotenv()
# Creating the engine to connect supabase with backend
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase : Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)
