from pydantic import BaseModel, Field


class LivenessRequest(BaseModel):
    challenge_type: str = Field(..., description="BLINK / SMILE / TURN_HEAD_LEFT")
    liveness_passed: bool
    motion_frames_detected: int
    total_frames: int


class LivenessResponse(BaseModel):
    success: bool
    application_id: str
    liveness_passed: bool
    message: str


class FaceResultRequest(BaseModel):
    match_score: float = Field(..., ge=0.0, le=1.0, description="Match score 0.0 to 1.0")
    distance: float = Field(..., description="Euclidean distance between face descriptors")
    liveness_passed: bool
    selfie_image: str = Field(..., description="Base64 encoded selfie image")


class FaceResultResponse(BaseModel):
    success: bool
    application_id: str
    match_score: float
    final_status: str       # approved / rejected only
    message: str
    reason: str | None = None   # rejection reason
    can_retry: bool
    retry_count: int
    next_step: str          # package_generation / face_verification
