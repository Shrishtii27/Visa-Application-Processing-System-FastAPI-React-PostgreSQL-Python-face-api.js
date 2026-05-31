import asyncio
from app.core.database import async_session
from app.models.application import Application
from app.models.enums import ApplicationStep, ApplicationStatus
from sqlalchemy import select, update

async def seed():
    async with async_session() as db:
        # Get latest application
        result = await db.execute(
            select(Application).order_by(Application.created_at.desc()).limit(1)
        )
        app = result.scalars().first()
        
        if not app:
            print("No application found")
            return
            
        mrz_data = {
            "mrz_string": "P<INDSRIVASTAVA<<SHRISHTI<<<<<<<<<<<<<<<<<<\nJ1234567<9IND0407274F3401011<<<<<<<<<<<<<<06",
            "fields": {
                "surname": "SRIVASTAVA",
                "given_names": "SHRISHTI",
                "nationality": "IND",
                "date_of_birth": "2004-07-27",
                "sex": "F",
                "expiry_date": "2034-01-01",
                "passport_number": "J1234567",
                "country_code": "IND"
            },
            "checksums": {
                "passport_number": {"valid": True, "expected": 9, "actual": 9},
                "date_of_birth": {"valid": True, "expected": 4, "actual": 4},
                "expiry_date": {"valid": True, "expected": 1, "actual": 1},
                "composite": {"valid": True, "expected": 6, "actual": 6},
                "is_valid": True
            },
            "ocr_confidence": 0.95,
            "low_confidence_fields": [],
            "warnings": []
        }
        
        await db.execute(
            update(Application)
            .where(Application.id == app.id)
            .values(
                passport_mrz_data=mrz_data,
                step=ApplicationStep.passport_upload
            )
        )
        await db.commit()
        print(f"Successfully seeded MRZ data for application {app.id}")

if __name__ == "__main__":
    asyncio.run(seed())
