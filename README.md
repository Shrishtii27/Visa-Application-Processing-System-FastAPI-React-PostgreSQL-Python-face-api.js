# POC - Visa Application Processing System

A FastAPI backend for processing visa and KYC-related applications with PostgreSQL, SQLAlchemy ORM, and Alembic migrations.

---

## Prerequisites

Make sure the following are installed on your system:

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.11+ | https://python.org |
| PostgreSQL | 14+ | https://postgresql.org |
| Git | any | https://git-scm.com |

---

## 1. Clone the Repository

```bash
git clone https://gitlab.rdprojects.tech/poc/poc.git
cd poc
```

If you already have the repo locally, just open the project folder and continue with the next steps.

---

## 2. Create the Database

Open **pgAdmin** or use `psql` in a terminal to create a new database:

```bash
# On Mac (Homebrew PostgreSQL):
createdb poc_db

# OR on any system via psql:
psql -c "CREATE DATABASE poc_db;"
```

Then enable the pgcrypto extension:
```bash
psql -d poc_db -c 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";'
```

---

## 3. Configure Environment Variables

The backend configuration lives in `backend/.env`.

```bash
cd backend
# On Windows
copy .env.example .env

# On macOS or Linux
cp .env.example .env
```

Now open `backend/.env` and update the values for your local environment:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/poc_db
SECRET_KEY=change-this-to-a-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=development
APP_NAME=POC Visa Application System
APP_VERSION=1.0.0
```

> ⚠️ On Mac (Homebrew), your username is usually your macOS username with no password.  
> Example: `DATABASE_URL=postgresql://yourname@localhost:5432/poc_db`

---

## 4. Create a Virtual Environment and Install Dependencies

Run the following commands from inside the `backend/` folder:

```bash
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

---

## 5. Run Database Migrations

Apply the Alembic migrations to create the database schema:

```bash
cd database/migrations

for file in $(ls *.sql | sort); do
  echo "Running $file..."
  psql -d poc_db -f "$file"
done
```

This will create **9 tables**, **7 enum types**, **26 indexes**, and seed data for countries, visa types, requirements, and form fields.

> 💡 All files use `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`, so you can safely re-run them without breaking anything.

**After pulling new changes**, only run the NEW migration files:
```bash
psql -d poc_db -f database/migrations/012_new_file.sql
```

---

## 6. Start the Server

From the `backend/` directory, run:

```bash
uvicorn app.main:app --reload
```

The server will be available at:

- `http://localhost:8000`

---

## 7. Verify It Is Working

Open your browser and visit:

- `http://localhost:8000` - should return `{"status":"online","message":"Welcome to the POC KYC Verification API"}`
- `http://localhost:8000/health` - should return `{"status":"healthy"}`
- `http://localhost:8000/docs` - interactive API documentation

---

## Project Structure

```text
poc/
backend/
  alembic/
    env.py
    README
    script.py.mako
    versions/
      84d2af6f4e72_initial_migration.py
  migrations/
  app/
    core/
      database.py
    models/
      __init__.py
      application.py
      audit_log.py
      base.py
      checklist.py
      country.py
      document.py
      enums.py
      field_config.py
      requirement.py
      user.py
      visa_type.py
    routers/
    schemas/
    services/
      face/
      ocr/
      visa/
    utils/
    main.py
  tests/
  .env.example
  alembic.ini
  requirements.txt
frontend/
.gitignore
README.md
```

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable production-ready code |
| `development` | Active development branch |
| `your-name-date` | Personal feature branch, for example `shrishti25may` |

Always branch off `development`, never directly from `main`:

```bash
git checkout development
git checkout -b yourname-date
```

---

## Notes

- The backend starts migrations automatically on application startup through `backend/app/main.py`.
- Upload directories and other file-processing settings are configured through `backend/.env`.
- If you are adding frontend work later, keep the API running on port `8000` and connect the UI to that base URL.
