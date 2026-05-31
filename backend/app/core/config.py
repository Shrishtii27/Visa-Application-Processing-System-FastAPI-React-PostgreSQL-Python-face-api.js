from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # App
    APP_NAME: str = "POC Visa Application System"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: str = "image/jpeg,image/png,application/pdf"
    PASSPORT_UPLOAD_DIR: str = "uploads/passports"
    BANK_STATEMENT_UPLOAD_DIR: str = "uploads/bank_statements"
    DOCUMENT_UPLOAD_DIR: str = "uploads/documents"
    FACE_UPLOAD_DIR: str = "uploads/faces"

    # OCR
    TESSERACT_PATH: str = "/usr/bin/tesseract"



    # Bank Statement
    BANK_STATEMENT_MAX_AGE_DAYS: int = 90
    BANK_STATEMENT_MIN_BALANCE_AED: float = 3000
    BANK_STATEMENT_MIN_BALANCE_GBP: float = 1000
    BANK_STATEMENT_MIN_BALANCE_USD: float = 2000
    BANK_STATEMENT_MIN_BALANCE_EUR: float = 1500
    BANK_STATEMENT_MIN_BALANCE_SGD: float = 2000

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def allowed_origins_list(self) -> list:
        return self.ALLOWED_ORIGINS.split(",")

    @property
    def allowed_file_types_list(self) -> list:
        return self.ALLOWED_FILE_TYPES.split(",")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
