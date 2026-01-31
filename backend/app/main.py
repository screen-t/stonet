from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router

# FastAPI application
app = FastAPI(title="Stonet Backend API")

# CORS settings - allow frontend development and production hosts
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:8080",  # Alternative dev port
    "http://localhost:3000",  # React dev server
    # Add your production frontend URL when ready:
    # "https://your-app.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

