from fastapi import FastAPI
from app.routes.auth import router as auth_router

#Configuration for using fastapi app with router
app = FastAPI(title="Stonet Backend")

app.include_router(auth_router)

