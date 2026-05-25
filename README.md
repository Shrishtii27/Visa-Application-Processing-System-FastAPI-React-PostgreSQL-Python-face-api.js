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

Open **pgAdmin** or use `psql` in terminal to create a new database:

```sql
CREATE DATABASE poc_db;
```

---

## 3. Configure Environment Variables

Go into the `backend/` folder and copy the example `.env` file:

```bash
cd backend
cp .env.example .env
```

Now open `backend/.env` and fill in your database credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/poc_db
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
CERTIFICATE_SECRET=your-certificate-secret-key
```

> ⚠️ Replace `YOUR_PASSWORD` with your actual PostgreSQL password.  
> If your PostgreSQL runs on a different port, update `5432` accordingly.

---

## 4. Create a Virtual Environment and Install Dependencies

```bash
# From inside the backend/ folder
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

This sets up all the tables and seeds the initial data (countries, visa types, etc.):

```bash
alembic upgrade head
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
