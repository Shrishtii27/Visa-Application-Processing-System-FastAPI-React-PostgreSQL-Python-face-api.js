import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def run():
    engine = create_async_engine("postgresql+asyncpg://postgres:7233@localhost:5433/poc_db")
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT passport_mrz_data FROM applications ORDER BY created_at DESC LIMIT 1"))
        row = result.fetchone()
        if row and row[0]:
            print("Name:", row[0].get("fields", {}).get("given_names"), row[0].get("fields", {}).get("surname"))
        else:
            print("No name found")

asyncio.run(run())
