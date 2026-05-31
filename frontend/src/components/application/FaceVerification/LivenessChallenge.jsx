import { useState, useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Check, X, Loader2 } from "lucide-react";

const CHALLENGES = ["SMILE", "BLINK", "TURN_HEAD_LEFT", "TURN_HEAD_RIGHT"];

const CHALLENGE_LABELS = {
  BLINK: "Please blink your eyes",
  SMILE: "Please smile",
  TURN_HEAD_LEFT: "Please turn your head to the left",
  TURN_HEAD_RIGHT: "Please turn your head to the right",
};

const COUNTDOWN_SECONDS = 5;
const FRAME_INTERVAL_MS = 500;
const MOTION_THRESHOLD = 2; // minimum motion frames across all steps

export function LivenessChallenge({ webcamRef, onComplete, detectBlink }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [status, setStatus] = useState("running"); // running | step_passed | failed | all_passed
  const [motionCount, setMotionCount] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);

  const challenge = CHALLENGES[currentStepIndex];

  const framesRef = useRef([]);
  const challengeMetRef = useRef(false);
  const motionCountRef = useRef(0);
  const totalFramesRef = useRef(0);
  const bestFrameRef = useRef(null);
  const bestScoreRef = useRef(0);
  
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const prevLandmarksRef = useRef(null);

  const captureFrame = useCallback(() => {
    if (!webcamRef.current) return null;
    try {
      const screenshot = webcamRef.current.getScreenshot();
      return screenshot;
    } catch {
      return null;
    }
  }, [webcamRef]);

  const analyzeFrame = useCallback(
    async (frameDataUrl) => {
      if (!frameDataUrl) return;

      try {
        const img = await faceapi.fetchImage(frameDataUrl);
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceExpressions();

        if (!detection) return;

        let challengeDetected = false;

        if (challenge === "BLINK") {
          challengeDetected = detectBlink(detection.landmarks);
        } else if (challenge === "SMILE") {
          challengeDetected = detection.expressions.happy > 0.5;
        } else if (challenge === "TURN_HEAD_LEFT") {
          const jaw = detection.landmarks.getJawOutline();
          const nose = detection.landmarks.getNose();
          const jawCenter = (jaw[0].x + jaw[jaw.length - 1].x) / 2;
          const noseTip = nose[nose.length - 1].x;
          challengeDetected = noseTip < jawCenter - 10;
        } else if (challenge === "TURN_HEAD_RIGHT") {
          const jaw = detection.landmarks.getJawOutline();
          const nose = detection.landmarks.getNose();
          const jawCenter = (jaw[0].x + jaw[jaw.length - 1].x) / 2;
          const noseTip = nose[nose.length - 1].x;
          challengeDetected = noseTip > jawCenter + 10;
        }

        if (challengeDetected) {
          challengeMetRef.current = true;
        }

        if (prevLandmarksRef.current) {
          const prevJaw = prevLandmarksRef.current.getJawOutline();
          const currentJaw = detection.landmarks.getJawOutline();
          let totalShift = 0;
          const count = Math.min(prevJaw.length, currentJaw.length);
          for (let i = 0; i < count; i++) {
            totalShift +=
              Math.abs(prevJaw[i].x - currentJaw[i].x) +
              Math.abs(prevJaw[i].y - currentJaw[i].y);
          }
          const avgShift = totalShift / count;
          if (avgShift > 1.5) {
            motionCountRef.current += 1;
            setMotionCount(motionCountRef.current);
          }
        }
        prevLandmarksRef.current = detection.landmarks;

        if (detection.detection.score > bestScoreRef.current) {
          bestScoreRef.current = detection.detection.score;
          bestFrameRef.current = frameDataUrl;
        }
      } catch (err) {
        console.error("Frame analysis error:", err);
      }
    },
    [challenge, detectBlink]
  );

  useEffect(() => {
    if (status !== "running") return;

    let secondsLeft = COUNTDOWN_SECONDS;
    challengeMetRef.current = false;
    setCountdown(secondsLeft);

    const triggerPass = () => {
      clearInterval(countdownRef.current);
      clearInterval(intervalRef.current);
      
      if (currentStepIndex === CHALLENGES.length - 1) {
        const passedOverall = motionCountRef.current >= MOTION_THRESHOLD;
        setStatus(passedOverall ? "all_passed" : "failed");
        
        setTimeout(() => {
          onComplete({
            challenge_type: "SEQUENTIAL_4_STEP",
            liveness_passed: passedOverall,
            motion_frames_detected: motionCountRef.current,
            total_frames: totalFramesRef.current,
            best_frame: bestFrameRef.current,
          });
        }, 1500);
      } else {
        setStatus("step_passed");
        setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
          setStatus("running");
        }, 1000);
      }
    };

    const triggerFail = () => {
      clearInterval(countdownRef.current);
      clearInterval(intervalRef.current);
      setStatus("failed");
      setTimeout(() => {
        onComplete({
          challenge_type: "SEQUENTIAL_4_STEP",
          liveness_passed: false,
          motion_frames_detected: motionCountRef.current,
          total_frames: totalFramesRef.current,
          best_frame: bestFrameRef.current,
        });
      }, 1500);
    };

    countdownRef.current = setInterval(() => {
      secondsLeft -= 1;
      setCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        triggerFail();
      }
    }, 1000);

    intervalRef.current = setInterval(async () => {
      const frame = captureFrame();
      if (frame) {
        totalFramesRef.current += 1;
        setTotalFrames(totalFramesRef.current);
        framesRef.current.push(frame);
        await analyzeFrame(frame);
        
        if (challengeMetRef.current) {
          triggerPass();
        }
      }
    }, FRAME_INTERVAL_MS);

    return () => {
      clearInterval(countdownRef.current);
      clearInterval(intervalRef.current);
    };
  }, [currentStepIndex, status, captureFrame, analyzeFrame, onComplete]);

  const circumference = 2 * Math.PI * 40;
  const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Liveness Check ({currentStepIndex + 1}/4)
        </p>
        <p className="mt-1 text-lg font-bold text-[#18246f]">
          {CHALLENGE_LABELS[challenge] || challenge}
        </p>
      </div>

      {status === "running" && (
        <div className="relative flex items-center justify-center">
          <svg width="96" height="96" className="-rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="6"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="#ff7a3d"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute text-2xl font-bold text-[#18246f]">
            {countdown}
          </span>
        </div>
      )}

      {status === "step_passed" && (
        <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.3s_ease-in]">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-emerald-600">
            Great! Next step...
          </p>
        </div>
      )}

      {status === "all_passed" && (
        <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.3s_ease-in]">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-emerald-600">
            Liveness verified!
          </p>
        </div>
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.3s_ease-in]">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-red-100">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-sm font-semibold text-red-600">
            Liveness check failed.
          </p>
        </div>
      )}

      {status === "running" && (
        <div className="flex flex-col items-center gap-1 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Analyzing frames: {totalFrames} captured</span>
          </div>
          <span>Motion detected: {motionCount}/{MOTION_THRESHOLD} req.</span>
        </div>
      )}
    </div>
  );
}
