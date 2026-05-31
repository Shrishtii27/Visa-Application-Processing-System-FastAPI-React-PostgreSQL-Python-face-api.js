import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import async_session
from app.models.country import DestinationCountry
from app.models.visa_type import VisaType
from app.models.enums import VisaPurpose
import uuid

VISA_TYPE_DESCRIPTIONS = {
    "tourist": "Issued for leisure, sightseeing, or short-term visits to friends and relatives. (e.g., US B2 Visa)",
    "business": "For professionals attending meetings, conferences, contract negotiations, or exploring business opportunities (does not permit taking up local employment).",
    "student": "Granted to international individuals accepted into recognized academic, vocational, or language programs. (e.g., US F or M Visa)",
    "work": "Allows foreign nationals to live and work in the country, usually tied to a specific employer or project.",
    "transit": "Very short-term (typically 24 to 96 hours) for travelers having stopovers or connecting flights in a country.",
    "medical": "For patients traveling abroad to seek specialized medical care and treatments not available in their home country.",
    "spouse_dependent": "For family members joining relatives who are already working, studying, or living as permanent residents abroad.",
    "immigrant_pr": "Allows long-term settlement, living indefinitely, and often provides a pathway to citizenship.",
    "diplomatic": "Reserved for government officials and diplomats on official state business.",
    "working_holiday": "Common in countries like Australia, New Zealand, and Canada, allowing young travelers to supplement their vacation with short-term jobs.",
    "journalist": "For reporters, correspondents, or documentary film crews.",
    "religious": "For individuals traveling to perform religious or charitable work."
}

# Helper to make visa names look nice
def get_visa_name(purpose_key: str) -> str:
    parts = purpose_key.split('_')
    return " ".join([p.capitalize() for p in parts]) + " Visa"

async def seed_data():
    async with async_session() as session:
        # We will seed these for US and AE as default countries
        countries_to_seed = [
            {"code": "US", "name": "United States"},
            {"code": "AE", "name": "United Arab Emirates"}
        ]
        
        for c in countries_to_seed:
            country_code = c["code"]
            # Verify country exists, if not create dummy
            result = await session.execute(select(DestinationCountry).where(DestinationCountry.country_code == country_code))
            country = result.scalars().first()
            if not country:
                country = DestinationCountry(
                    country_code=country_code,
                    country_name=c["name"],
                    is_active=True
                )
                session.add(country)
                await session.commit()
                print(f"Added Country: {c['name']}")
                
            # Seed all visa types for this country
            for purpose_key, desc in VISA_TYPE_DESCRIPTIONS.items():
                purpose_enum = getattr(VisaPurpose, purpose_key)
                visa_name = get_visa_name(purpose_key)
                
                result = await session.execute(
                    select(VisaType).where(
                        VisaType.country_code == country_code,
                        VisaType.purpose == purpose_enum
                    )
                )
                visa_type = result.scalars().first()
                
                if visa_type:
                    # Upsert description if it differs or is missing
                    if visa_type.description != desc or visa_type.visa_name != visa_name:
                        visa_type.description = desc
                        visa_type.visa_name = visa_name
                        print(f"Updated Visa: {country_code} - {visa_name}")
                else:
                    visa_type = VisaType(
                        country_code=country_code,
                        purpose=purpose_enum,
                        visa_name=visa_name,
                        description=desc,
                        is_active=True
                    )
                    session.add(visa_type)
                    print(f"Created Visa: {country_code} - {visa_name}")
                    
            await session.commit()
        print("Seeding Complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
