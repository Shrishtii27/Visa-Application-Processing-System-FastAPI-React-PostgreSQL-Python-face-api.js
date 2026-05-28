import os
import magic
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException
from typing import Tuple

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "application/pdf"}
UPLOAD_BASE_DIR = "uploads"

async def validate_and_save_file(
    file: UploadFile, 
    application_id: uuid.UUID, 
    document_type: str = "passports"
) -> Tuple[str, int, str]:
    """
    Validates a file's size and MIME type, then saves it securely.
    Returns: (saved_file_path, file_size_kb, real_mime_type)
    """
    # 1. Read the first 2048 bytes for magic validation
    header_bytes = await file.read(2048)
    await file.seek(0)  # Reset pointer for saving
    
    # 2. Validate MIME type using python-magic
    real_mime_type = magic.from_buffer(header_bytes, mime=True)
    if real_mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type: {real_mime_type}. Allowed types are: JPEG, PNG, PDF."
        )

    # 3. Save file while calculating size
    upload_dir = os.path.join(UPLOAD_BASE_DIR, document_type, str(application_id))
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate secure filename (e.g., preserving extension from mime type)
    ext = ".pdf" if real_mime_type == "application/pdf" else (".png" if real_mime_type == "image/png" else ".jpg")
    file_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, file_name)
    
    file_size_bytes = 0
    async with aiofiles.open(file_path, "wb") as buffer:
        while True:
            chunk = await file.read(1024 * 1024)  # 1MB chunks
            if not chunk:
                break
            file_size_bytes += len(chunk)
            if file_size_bytes > MAX_FILE_SIZE:
                os.remove(file_path)
                raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
            await buffer.write(chunk)
            
    file_size_kb = file_size_bytes // 1024
    return file_path, file_size_kb, real_mime_type
