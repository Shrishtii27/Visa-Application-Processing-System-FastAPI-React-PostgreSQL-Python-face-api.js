import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SplitLayout } from "@/components/SplitLayout";
import img from "@/assets/face-verify-new.jpg";
import { Camera, RotateCcw, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/camera")({ component: CameraPage });

const CUES = ["Center your face", "Blink slowly", "Smile", "Hold still"];

function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [cue, setCue] = useState(0);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

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
    } catch (e) {
      setError(e?.message || "Unable to access camera. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || captured) return;
    const id = setInterval(() => setCue((c) => (c + 1) % CUES.length), 2200);
    return () => clearInterval(id);
  }, [ready, captured]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
    stopCamera();
    toast.success("Image captured");
  };

  const retake = async () => {
    setCaptured(null);
    setCue(0);
    await startCamera();
  };

  return (
    <>
      <SplitLayout
        image={img}
        imageAlt="Facial recognition verification"
        eyebrow="Step 6"
        title="Camera Verification"
        subtitle="Position your face inside the frame and follow the on-screen prompts."
      >
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="relative w-full overflow-hidden rounded-2xl bg-black aspect-video lg:aspect-[4/3]">
            {!captured ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="h-full w-full object-cover -scale-x-100"
                />
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-accent/80 shadow-[0_0_60px_-10px_var(--accent)]" />
                  <div className="absolute left-0 right-0 top-0 mx-auto w-fit translate-y-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-foreground">
                    {ready ? CUES[cue] : "Starting camera…"}
                  </div>
                </div>
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 p-6 text-center text-white">
                    <AlertCircle className="h-8 w-8 text-accent" />
                    <p className="text-sm">{error}</p>
                    <button
                      onClick={startCamera}
                      className="mt-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground"
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
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
              >
                <Camera className="h-4 w-4" /> Capture
              </button>
            ) : (
              <>
                <button
                  onClick={retake}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  <RotateCcw className="h-4 w-4" /> Retake
                </button>
                <button
                  onClick={() => navigate({ to: "/face-result" })}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
                >
                  <Check className="h-4 w-4" /> Match Face
                </button>
              </>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Liveness checks: Blink · Smile · Hold still
          </p>
        </div>
      </SplitLayout>
    </>
  );
}