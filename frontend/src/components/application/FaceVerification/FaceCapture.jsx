import { useState, useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Camera, RotateCcw, Check, AlertCircle } from "lucide-react";

/**
 * Face capture component with real-time detection overlay.
 *
 * Props:
 *   onCapture: (imageBase64: string) => void
 *   webcamRef: React.RefObject<Webcam>
 */
export function FaceCapture({ onCapture, webcamRef }) {
  const [captured, setCaptured] = useState(null);
  const [faceStatus, setFaceStatus] = useState("no_face"); // no_face | detected | multiple | ready
  const canvasRef = useRef(null);
  const detectionLoopRef = useRef(null);

  /**
   * Run face detection loop on the webcam video feed.
   * Draws bounding boxes and updates face status.
   */
  const runDetectionLoop = useCallback(async () => {
    if (!webcamRef.current || !webcamRef.current.video || captured) return;

    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    try {
      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks();

      // Draw overlay
      const canvas = canvasRef.current;
      if (canvas) {
        const displaySize = {
          width: video.videoWidth,
          height: video.videoHeight,
        };
        faceapi.matchDimensions(canvas, displaySize);
        const resized = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length === 1) {
          const det = resized[0];
          const box = det.detection.box;

          // Check if face is centered (within middle 60% of frame)
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          const isCenteredX =
            centerX > displaySize.width * 0.2 &&
            centerX < displaySize.width * 0.8;
          const isCenteredY =
            centerY > displaySize.height * 0.2 &&
            centerY < displaySize.height * 0.8;
          const isCentered = isCenteredX && isCenteredY;

          // Check if face is large enough (> 15% of frame area)
          const faceArea = box.width * box.height;
          const frameArea = displaySize.width * displaySize.height;
          const isLargeEnough = faceArea > frameArea * 0.15;

          const isReady = isCentered && isLargeEnough;

          // Draw bounding box
          ctx.strokeStyle = isReady ? "#22c55e" : "#f59e0b";
          ctx.lineWidth = 3;
          ctx.setLineDash(isReady ? [] : [8, 4]);
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          // Draw corner accents
          const cornerLen = 16;
          ctx.setLineDash([]);
          ctx.lineWidth = 4;
          ctx.strokeStyle = isReady ? "#16a34a" : "#d97706";
          // Top-left
          ctx.beginPath();
          ctx.moveTo(box.x, box.y + cornerLen);
          ctx.lineTo(box.x, box.y);
          ctx.lineTo(box.x + cornerLen, box.y);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(box.x + box.width - cornerLen, box.y);
          ctx.lineTo(box.x + box.width, box.y);
          ctx.lineTo(box.x + box.width, box.y + cornerLen);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(box.x, box.y + box.height - cornerLen);
          ctx.lineTo(box.x, box.y + box.height);
          ctx.lineTo(box.x + cornerLen, box.y + box.height);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(box.x + box.width - cornerLen, box.y + box.height);
          ctx.lineTo(box.x + box.width, box.y + box.height);
          ctx.lineTo(box.x + box.width, box.y + box.height - cornerLen);
          ctx.stroke();

          setFaceStatus(isReady ? "ready" : "detected");
        } else if (detections.length > 1) {
          // Multiple faces — draw all boxes in red
          resized.forEach((det) => {
            const box = det.detection.box;
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);
            ctx.strokeRect(box.x, box.y, box.width, box.height);
          });
          setFaceStatus("multiple");
        } else {
          setFaceStatus("no_face");
        }
      }
    } catch (err) {
      // Silently continue — detection loop shouldn't crash
    }
  }, [webcamRef, captured]);

  // Start detection loop
  useEffect(() => {
    if (captured) return;

    detectionLoopRef.current = setInterval(runDetectionLoop, 300);

    return () => {
      if (detectionLoopRef.current) {
        clearInterval(detectionLoopRef.current);
      }
    };
  }, [runDetectionLoop, captured]);

  const handleCapture = () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (screenshot) {
      setCaptured(screenshot);
    }
  };

  const handleRetake = () => {
    setCaptured(null);
    setFaceStatus("no_face");
  };

  const handleUse = () => {
    if (captured) {
      onCapture(captured);
    }
  };

  const statusLabels = {
    no_face: { text: "No face detected", color: "text-red-500", icon: AlertCircle },
    detected: { text: "Move closer & center your face", color: "text-amber-500", icon: AlertCircle },
    multiple: { text: "Multiple faces detected — only one allowed", color: "text-red-500", icon: AlertCircle },
    ready: { text: "Face detected — ready to capture!", color: "text-emerald-500", icon: Check },
  };

  const currentStatus = statusLabels[faceStatus];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-4">
      {/* Camera feed area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
        {!captured ? (
          <>
            {/* Canvas overlay for face detection boxes */}
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 z-10 h-full w-full -scale-x-100"
            />

            {/* Guide frame */}
            <div className="pointer-events-none absolute inset-0 z-[5]">
              <div
                className={[
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed transition-colors duration-300",
                  faceStatus === "ready"
                    ? "border-emerald-400/80"
                    : "border-[#ff7a3d]/60",
                ].join(" ")}
                style={{ width: "55%", height: "70%" }}
              />
            </div>

            {/* Status badge */}
            <div className="absolute left-0 right-0 top-0 z-20 mx-auto w-fit translate-y-3 rounded-full bg-white/90 px-3 py-1">
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${currentStatus.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {currentStatus.text}
              </span>
            </div>
          </>
        ) : (
          <img
            src={captured}
            alt="Captured selfie"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Instructions */}
      {!captured && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700 mb-1.5">
            Tips for best results:
          </p>
          <ul className="space-y-0.5 text-xs text-slate-500">
            <li>• Position your face in the oval guide</li>
            <li>• Ensure good, even lighting</li>
            <li>• Remove glasses if possible</li>
            <li>• Keep a neutral expression</li>
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!captured ? (
          <button
            onClick={handleCapture}
            disabled={faceStatus !== "ready" && faceStatus !== "detected"}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ff7a3d] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(255,122,61,0.24)] transition hover:bg-[#ff6a22] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="h-4 w-4" />
            Capture Photo
          </button>
        ) : (
          <>
            <button
              onClick={handleRetake}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#18246f] transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Retake
            </button>
            <button
              onClick={handleUse}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b]"
            >
              <Check className="h-4 w-4" />
              Use This Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
