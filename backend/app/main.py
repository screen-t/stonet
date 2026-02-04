from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.oauth import router as oauth_router

#Configuration for using fastapi app with router
app = FastAPI(title="Stonet Backend")

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

app.include_router(auth_router)
app.include_router(oauth_router)

