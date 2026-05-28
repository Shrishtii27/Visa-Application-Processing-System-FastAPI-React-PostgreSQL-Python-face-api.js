import asyncio
from app.core.database import async_session
from app.models.application import Application
from app.models.audit_log import AuditLog
from sqlalchemy import update, delete

async def reset():
    async with async_session() as session:
        # Delete audit logs for face_verified
        await session.execute(delete(AuditLog).where(AuditLog.event_type == 'face_verified'))
        # Update applications
        await session.execute(update(Application).values(step='face_verification', status='draft'))
        await session.commit()
        print("Reset successful")

if __name__ == "__main__":
    asyncio.run(reset())
