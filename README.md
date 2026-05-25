# POC — Visa Application Processing System

A FastAPI backend for processing visa applications with PostgreSQL, SQLAlchemy ORM, and Alembic migrations.

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

---

## 2. Set Up the Database

Open terminal and create the database:

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

Copy the example `.env` files and fill in your credentials:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Open `backend/.env` and update your PostgreSQL password:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/poc_db
```

> ⚠️ On Mac (Homebrew), your username is usually your macOS username with no password.  
> Example: `DATABASE_URL=postgresql://yourname@localhost:5432/poc_db`

---

## 4. Create a Virtual Environment and Install Dependencies

```bash
# From inside the backend/ folder
cd backend
python -m venv .venv

# Activate it
# On Mac/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt
```

---

## 5. Run Database Migrations

Run all SQL migration files to create tables and seed data:

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

```bash
uvicorn app.main:app --reload
```

The server will be running at: **http://localhost:8000**

---

## 7. Verify It's Working

Open your browser and visit:
- **http://localhost:8000** — should return `{"status": "online"}`
- **http://localhost:8000/docs** — interactive API documentation

---

## Project Structure

```
poc/
├── backend/
│   ├── alembic/                  # Database migration scripts
│   │   └── versions/
│   │       └── 84d2af6f4e72_initial_migration.py
│   ├── app/
│   │   ├── core/
│   │   │   └── database.py       # DB engine, session, migration runner
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── base.py
│   │   │   ├── enums.py
│   │   │   ├── user.py
│   │   │   ├── country.py
│   │   │   ├── visa_type.py
│   │   │   ├── requirement.py
│   │   │   ├── field_config.py
│   │   │   ├── application.py
│   │   │   ├── document.py
│   │   │   ├── audit_log.py
│   │   │   └── checklist.py
│   │   └── main.py               # FastAPI app entry point
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env.example
├── frontend/
├── .gitignore
└── README.md
```

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable production-ready code |
| `development` | Active development branch |
| `your-name-date` | Personal feature branch (e.g. `shrishti25may`) |

Always branch off `development`, never directly from `main`.

```bash
git checkout development
git checkout -b yourname-date
```
