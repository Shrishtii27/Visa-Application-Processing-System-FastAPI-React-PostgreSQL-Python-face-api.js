import os
import asyncio
import logging
from pathlib import Path
from dotenv import load_dotenv

from alembic.config import Config
from alembic import command
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database_migrations")

# Load environment variables
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent.parent

# Check backend/.env
backend_env = backend_dir / ".env"
if backend_env.exists():
    load_dotenv(backend_env, override=True)
# Check root .env
root_env = backend_dir.parent / ".env"
if root_env.exists():
    load_dotenv(root_env, override=True)

database_url = os.getenv("DATABASE_URL")
if database_url:
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine and sessionmaker
engine = create_async_engine(database_url, echo=False, future=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    """
    Dependency generator yielding an asynchronous database session.
    """
    async with async_session() as session:
        yield session

async def run_migrations():
    """
    Runs Alembic migrations programmatically on startup.
    Executes in a separate thread so that Alembic's async execution is blocked and awaited correctly.
    """
    logger.info("Checking database migrations...")
    alembic_ini_path = backend_dir / "alembic.ini"
    alembic_cfg = Config(str(alembic_ini_path))
    alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    
    try:
        # Run Alembic upgrade in a separate thread to block and await its async event loop correctly
        await asyncio.to_thread(command.upgrade, alembic_cfg, "head")
        logger.info("Database migrations check completed.")
    except Exception as e:
        logger.error(f"Failed to run database migrations: {e}")
