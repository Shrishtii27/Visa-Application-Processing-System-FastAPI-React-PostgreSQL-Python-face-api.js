import uuid
from fastapi import UploadFile
from app.core import files

async def validate_and_save_uploaded_file(
    file: UploadFile, 
    application_id: uuid.UUID, 
    document_type: str = "passports"
) -> tuple[str, int, str]:
    """
    Validates file size (max 10MB) and type (JPEG, PNG, PDF), and saves it securely to disk.
    Returns: (saved_file_path, file_size_kb, real_mime_type)
    """
    return await files.validate_and_save_file(file, application_id, document_type)
