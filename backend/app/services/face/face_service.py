import os
import base64
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.audit_log import AuditLog


class FaceService:
    """
    Service layer for face verification operations.
    All face matching happens in the browser — this service only handles
    storage, thresholds, and retry counting.
    """

    UPLOAD_BASE_DIR = "uploads/faces"

    # Thresholds
    SCORE_APPROVED = 0.82
    SCORE_MANUAL_REVIEW = 0.65
    MAX_RETRIES = 3

    def save_selfie(self, application_id: str, base64_image: str) -> str:
        """
        Decode a base64 selfie image and save to disk.
        Returns the saved file path.
        """
        # Create directory if not exists
        upload_dir = os.path.join(self.UPLOAD_BASE_DIR, str(application_id))
        os.makedirs(upload_dir, exist_ok=True)

        # Strip data URI prefix if present (e.g. "data:image/jpeg;base64,...")
        if "," in base64_image:
            base64_image = base64_image.split(",", 1)[1]

        # Decode base64
        image_bytes = base64.b64decode(base64_image)

        # Save as selfie.jpg
        file_path = os.path.join(upload_dir, "selfie.jpg")
        with open(file_path, "wb") as f:
            f.write(image_bytes)

        return file_path



    async def get_retry_count(self, application_id: uuid.UUID, db: AsyncSession) -> int:
        """
        Count the number of face_verified audit log entries for this application.
        """
        result = await db.execute(
            select(func.count(AuditLog.id)).where(
                AuditLog.application_id == application_id,
                AuditLog.event_type == "face_verified"
            )
        )
        return result.scalar() or 0


# Singleton instance
face_service = FaceService()
