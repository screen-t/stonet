from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.oauth import router as oauth_router
from app.routes.profile import router as profile_router
from app.routes.posts import router as posts_router
from app.routes.connections import router as connections_router
from app.routes.messages import router as messages_router
from app.routes.notifications import router as notifications_router
from app.routes.search import router as search_router

# FastAPI application
app = FastAPI(title="Stonet Backend API")

# CORS settings - allow frontend development and production hosts
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:8080",  # Alternative dev port
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:8080",  # Localhost alternative
    "http://127.0.0.1:5173",
    # Add your production frontend URL when ready:
    # "https://your-app.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Root endpoint
@app.get("/")
def root():
    return {"message": "Stonet Backend API", "status": "running"}

# Health check endpoint for monitoring
@app.get("/health")
def health():
    return {"status": "healthy"}

# Include authentication routes
app.include_router(auth_router)
app.include_router(oauth_router)
app.include_router(profile_router)
app.include_router(posts_router)
app.include_router(connections_router)
app.include_router(messages_router)
app.include_router(notifications_router)
app.include_router(search_router)

