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

```sql
CREATE DATABASE poc_db;
```

---

## 3. Configure Environment Variables

The backend configuration lives in `backend/.env`.

```bash
cd backend
copy .env.example .env
```

On macOS or Linux, use:

```bash
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
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
PASSPORT_UPLOAD_DIR=uploads/passports
BANK_STATEMENT_UPLOAD_DIR=uploads/bank_statements
DOCUMENT_UPLOAD_DIR=uploads/documents
FACE_UPLOAD_DIR=uploads/faces
TESSERACT_PATH=/usr/bin/tesseract
FACE_MATCH_PASS_THRESHOLD=0.82
FACE_MATCH_REVIEW_THRESHOLD=0.65
BANK_STATEMENT_MAX_AGE_DAYS=90
BANK_STATEMENT_MIN_BALANCE_AED=3000
BANK_STATEMENT_MIN_BALANCE_GBP=1000
BANK_STATEMENT_MIN_BALANCE_USD=2000
BANK_STATEMENT_MIN_BALANCE_EUR=1500
BANK_STATEMENT_MIN_BALANCE_SGD=2000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

> Replace `user` and `password` with your actual PostgreSQL credentials.  
> If PostgreSQL is running on a different port, update `5432` accordingly.

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
alembic upgrade head
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
