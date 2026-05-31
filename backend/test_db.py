import asyncio
from app.core.database import async_session
from app.models.user import User
from sqlalchemy.future import select

async def main():
    try:
        async with async_session() as session:
            result = await session.execute(select(User).limit(1))
            print("DB success:", result.scalars().first())
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("DB ERROR:", type(e).__name__, e)

if __name__ == "__main__":
    asyncio.run(main())
