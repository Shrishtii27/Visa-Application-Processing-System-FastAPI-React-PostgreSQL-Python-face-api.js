import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.future import select
from sqlalchemy import delete
from app.models.application import Application
import os
from dotenv import load_dotenv

load_dotenv(".env", override=True)
database_url = os.getenv("DATABASE_URL")
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(database_url, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def main():
    async with async_session() as session:
        await session.execute(delete(Application))
        await session.commit()
        print("All applications deleted.")

asyncio.run(main())
