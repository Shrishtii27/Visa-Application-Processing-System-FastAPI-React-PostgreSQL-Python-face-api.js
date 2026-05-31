import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv(".env")
database_url = os.getenv("DATABASE_URL")
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

async def check():
    engine = create_async_engine(database_url)
    async with engine.begin() as conn:
        # Get latest application
        res_app = await conn.execute(text(
            "SELECT id, visa_type_id, step, status, applicant_nationality FROM applications ORDER BY id DESC LIMIT 5"
        ))
        apps = res_app.fetchall()
        print("LATEST APPLICATIONS:")
        for app in apps:
            print(app)
            # Get form configs
            if app[1]:
                res_fields = await conn.execute(text(
                    f"SELECT field_name, field_label, field_type, options, validation_regex FROM form_field_config WHERE visa_type_id = '{app[1]}' ORDER BY display_order"
                ))
                fields = res_fields.fetchall()
                print(f"  FORM FIELDS FOR VISA TYPE {app[1]}:")
                for f in fields:
                    print("   ", f)


asyncio.run(check())
