from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import run_migrations
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    await run_migrations()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Visa Application Processing System — Pre-screening & Package Generator",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check routes
@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# NOTE: Routers will be registered here one by one
# as we build them:
# app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
# app.include_router(countries_router, prefix="/api/countries", tags=["Countries"])
# app.include_router(applications_router, prefix="/api/applications", tags=["Applications"])
# app.include_router(documents_router, prefix="/api/applications", tags=["Documents"])
# app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
