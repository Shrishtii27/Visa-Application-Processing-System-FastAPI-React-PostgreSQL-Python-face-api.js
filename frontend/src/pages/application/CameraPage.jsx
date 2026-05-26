import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Camera, Check, RotateCcw } from "lucide-react";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";

const CUES = ["Center your face", "Blink slowly", "Smile", "Hold still"];

export function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [cue, setCue] = useState(0);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setReady(false);
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
      }
    } catch (cameraError) {
      setError(cameraError?.message || "Unable to access camera. Please allow camera permission.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || captured) return;
    const interval = setInterval(() => {
      setCue((current) => (current + 1) % CUES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [ready, captured]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
    stopCamera();
  };

  const retake = async () => {
    setCaptured(null);
    setCue(0);
    await startCamera();
  };

  return (
    <>
      <StepProgress current={6} />
      <SplitLayout
        image="/assets/face-verify-new.jpg"
        imageAlt="Facial recognition verification"
        eyebrow="Step 6"
        title="Camera Verification"
        subtitle="Position your face inside the frame and follow the on-screen prompts."
      >
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black lg:aspect-[4/3]">
            {!captured ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="h-full w-full object-cover -scale-x-100"
                />
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-[#ff7a3d]/80 shadow-[0_0_60px_-10px_var(--accent)]" />
                  <div className="absolute left-0 right-0 top-0 mx-auto w-fit translate-y-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#18246f]">
                    {ready ? CUES[cue] : "Starting camera..."}
                  </div>
                </div>
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 p-6 text-center text-white">
                    <AlertCircle className="h-8 w-8 text-[#ff7a3d]" />
                    <p className="text-sm">{error}</p>
                    <button
                      onClick={startCamera}
                      className="mt-2 rounded-lg bg-[#ff7a3d] px-4 py-2 text-xs font-semibold text-white"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </>
            ) : (
              <img src={captured} alt="Captured selfie" className="h-full w-full object-cover" />
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-3">
            {!captured ? (
              <button
                onClick={capture}
                disabled={!ready}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ff7a3d] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(255,122,61,0.24)] transition hover:bg-[#ff6a22] disabled:opacity-50"
              >
                <Camera className="h-4 w-4" /> Capture
              </button>
            ) : (
              <>
                <button
                  onClick={retake}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#18246f] transition hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" /> Retake
                </button>
                <button
                  onClick={() => navigate("/face-result")}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b]"
                >
                  <Check className="h-4 w-4" /> Match Face
                </button>
              </>
            )}
          </div>

          <p className="text-center text-xs text-slate-500">
            Liveness checks: Blink · Smile · Hold still
          </p>
        </div>
      </SplitLayout>
    </>
  );
}
