import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * FaceResultPage — redirects to the camera page which now handles
 * the full face verification flow including results display.
 */
export function FaceResultPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/camera", { replace: true });
  }, [navigate]);

  return null;
}
