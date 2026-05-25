from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.database import run_migrations

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run database migrations on startup
    await run_migrations()
    yield
    # Add any shutdown cleanup code here if needed

app = FastAPI(
    title="POC KYC Verification Backend",
    description="FastAPI Backend for POC KYC Verification system",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to the POC KYC Verification API"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
