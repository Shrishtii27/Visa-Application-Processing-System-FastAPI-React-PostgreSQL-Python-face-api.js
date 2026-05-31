import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def run():
    engine = create_async_engine("postgresql+asyncpg://postgres:7233@localhost:5433/poc_db")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        result = await session.execute(text("SELECT id FROM applications ORDER BY created_at DESC LIMIT 1"))
        row = result.fetchone()
        if row:
            app_id = row[0]
            print(f"Latest App ID: {app_id}")
            doc_res = await session.execute(text(f"SELECT id, document_type, status FROM uploaded_documents WHERE application_id = '{app_id}'"))
            docs = doc_res.fetchall()
            print("Documents for this app:")
            for d in docs:
                print(f" - {d[1]} (Status: {d[2]})")
        else:
            print("No app found")

asyncio.run(run())
