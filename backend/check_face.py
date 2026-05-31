import asyncio
from app.core.database import async_session
from app.models.application import Application
from sqlalchemy import select

async def check():
    async with async_session() as db:
        result = await db.execute(
            select(Application).order_by(Application.created_at.desc()).limit(1)
        )
        app = result.scalars().first()
        if not app:
            print("No app")
            return
        print(f"ID: {app.id}")
        print(f"Face Score: {app.face_score}")

if __name__ == "__main__":
    asyncio.run(check())
