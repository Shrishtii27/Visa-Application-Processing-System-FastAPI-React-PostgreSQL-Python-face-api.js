import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, RotateCcw, XCircle, Loader2, HelpCircle, Camera, Check } from "lucide-react";
import Webcam from "react-webcam";
import { SplitLayout } from "../../components/shared/SplitLayout";
import { StepProgress } from "../../components/shared/StepProgress";
import { useApplication } from "../../context/ApplicationContext";
import { useFaceApi } from "../../components/application/FaceVerification/useFaceApi";
import { LivenessChallenge } from "../../components/application/FaceVerification/LivenessChallenge";
import { api } from "../../services/api";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export function CameraPage() {
  const navigate = useNavigate();
  const { applicationId } = useApplication();
  const webcamRef = useRef(null);
  
  // State machine
  const [step, setStep] = useState("loading_models");
  const [error, setError] = useState(null);
  
  const [livenessResult, setLivenessResult] = useState(null);
  const [faceResult, setFaceResult] = useState(null);
  const [processingMessage, setProcessingMessage] = useState("");
  const [captured, setCaptured] = useState(null);

  const [passportDescriptor, setPassportDescriptor] = useState(null);

  const {
    modelsLoaded,
    error: modelsError,
    detectBlink,
    extractPassportFace,
    detectFace,
    compareFaces,
  } = useFaceApi();

  // Load models -> extract face
  useEffect(() => {
    if (step === "loading_models") {
      if (modelsError) {
        setError(modelsError);
      } else if (modelsLoaded) {
        setStep("extracting_passport_face");
      }
    }
  }, [step, modelsLoaded, modelsError]);

  // Extract face from passport automatically
  useEffect(() => {
    let mounted = true;

    const extract = async () => {
      try {
        if (!applicationId) {
          throw new Error("No active application found.");
        }
        
        const checkUrl = `${API_BASE}/applications/${applicationId}/face/passport-image`;
        const token = localStorage.getItem("access_token");
        const resp = await fetch(checkUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (!resp.ok) {
          throw new Error("Valid passport document not found. Please re-upload your passport.");
        }

        const blob = await resp.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const descriptor = await extractPassportFace(objectUrl);
        URL.revokeObjectURL(objectUrl);

        if (!descriptor) {
          throw new Error("Could not detect a face in the passport photo. Please upload a clearer passport.");
        }
        
        setPassportDescriptor(descriptor);
        await new Promise(r => setTimeout(r, 1000));
        
        if (mounted) setStep("liveness_challenge");
      } catch (err) {
        if (mounted) setError(err.message);
      }
    };
    
    if (step === "extracting_passport_face") {
      extract();
    }
    
    return () => { mounted = false; };
  }, [step, applicationId]);

  const handleLivenessComplete = useCallback((result) => {
    setLivenessResult(result);
    if (result.liveness_passed) {
      setStep("capturing_selfie");
    } else {
      setError("Liveness check failed. Please try again and follow the instructions carefully.");
    }
  }, []);

  const handleCapture = () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (screenshot) {
      setCaptured(screenshot);
    }
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  const handleUseSelfie = async () => {
    if (!captured) return;
    setStep("processing");
    setProcessingMessage("Analyzing your selfie...");
    
    try {
      if (!applicationId) {
        throw new Error("No active application found.");
      }

      if (!passportDescriptor) {
        throw new Error("Missing passport data for comparison.");
      }

      // Extract descriptor from selfie
      const selfieImg = new Image();
      selfieImg.src = captured;
      await new Promise((resolve) => { selfieImg.onload = resolve; });

      const selfieDetection = await detectFace(selfieImg);
      if (!selfieDetection) {
         throw new Error("Could not detect a face in your selfie. Please retake it in better lighting.");
      }

      setProcessingMessage("Secure face matching in progress...");

      // Compare using strict threshold
      const { score, distance, verified } = compareFaces(passportDescriptor, selfieDetection.descriptor);

      const response = await api.fetch(
        `/applications/${applicationId}/face/result`,
        {
          method: "POST",
          body: JSON.stringify({
            selfie_image: captured,
            match_score: score, // Send the calculated 0.0-1.0 confidence score
            distance: distance, // Send the calculated distance
            liveness_passed: livenessResult?.liveness_passed ?? false,
          }),
        }
      );

      setFaceResult(response);
      setStep("result");
    } catch (err) {
      setError(err.message || "Failed to process face verification");
    }
  };

  const handleRetry = () => {
    setError(null);
    setFaceResult(null);
    setLivenessResult(null);
    setCaptured(null);
    setStep("loading_models");
  };

  // ─── Webcam panel (right side) ─────────────────────────────
  const showWebcam = ["liveness_challenge", "capturing_selfie"].includes(step) && !captured;

  const webcamPanel = (
    <div className="w-full max-w-xl overflow-hidden rounded-3xl shadow-card bg-black">
      {showWebcam ? (
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
          mirrored
          className="w-full aspect-[4/3] object-cover"
        />
      ) : captured ? (
        <img
          src={captured}
          alt="Captured selfie"
          className="w-full aspect-[4/3] object-cover"
        />
      ) : (
        <img
          src="/assets/face-verify-new.jpg"
          alt="Face verification"
          className="w-full aspect-[4/3] object-cover"
        />
      )}
    </div>
  );

  // ─── Left panel content (compact controls) ────────────────

  const renderLoadingModels = () => (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="relative">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#ff7a3d]/20 to-[#22348f]/20 animate-pulse" />
        <Loader2 className="absolute inset-0 m-auto h-7 w-7 animate-spin text-[#ff7a3d]" />
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-[#18246f]">Loading Face Detection</p>
        <p className="mt-1 text-sm text-slate-500">Preparing AI models...</p>
      </div>
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-full animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-[#ff7a3d]/40 to-transparent" />
      </div>
    </div>
  );

  const renderExtractingPassport = () => (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <Loader2 className="h-7 w-7 animate-spin text-[#22348f]" />
      <div className="text-center">
        <p className="text-base font-bold text-[#18246f]">Analyzing Passport Photo</p>
        <p className="mt-1 text-sm text-slate-500">Locating face in passport...</p>
      </div>
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#ff7a3d] to-[#22348f] animate-pulse" />
      </div>
    </div>
  );

  const renderLivenessChallenge = () => (
    <LivenessChallenge
      webcamRef={webcamRef}
      onComplete={handleLivenessComplete}
      detectBlink={detectBlink}
    />
  );

  const renderCapturingSelfie = () => (
    <div className="space-y-4">
      {/* Tips */}
      {!captured && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700 mb-1.5">Tips for best results:</p>
          <ul className="space-y-0.5 text-xs text-slate-500">
            <li>• Position your face in the center</li>
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
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ff7a3d] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(255,122,61,0.24)] transition hover:bg-[#ff6a22]"
          >
            <Camera className="h-4 w-4" />
            Capture Photo
          </button>
        ) : (
          <>
            <button
              onClick={handleRetake}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#18246f] transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Retake
            </button>
            <button
              onClick={handleUseSelfie}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#22348f] text-sm font-semibold text-white shadow-[0_14px_35px_rgba(34,52,143,0.2)] transition hover:bg-[#1b2d7b]"
            >
              <Check className="h-4 w-4" />
              Use This Photo
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <Loader2 className="h-7 w-7 animate-spin text-[#22348f]" />
      <div className="text-center">
        <p className="text-base font-bold text-[#18246f]">Verifying Identity</p>
        <p className="mt-1 text-sm text-slate-500">{processingMessage}</p>
      </div>
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#ff7a3d] to-[#22348f] animate-pulse" />
      </div>
    </div>
  );

  const renderResult = () => {
    if (!faceResult) return null;
    const result = faceResult;

    if (result.final_status === 'approved') {
      return (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-green-700">Identity Verified</h2>
          <p className="text-sm text-gray-600">
            Face match score: {(result.match_score * 100).toFixed(0)}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-[width] duration-1000"
              style={{ width: `${result.match_score * 100}%` }}
            />
          </div>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.sessionStorage.setItem("visa.matchScore", String(Math.round(result.match_score * 100)));
              }
              navigate("/result");
            }}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            Continue to Summary →
          </button>
        </div>
      );
    }

    if (result.final_status === 'rejected') {
      return (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-700">Verification Failed</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
            <p className="text-red-700 text-xs font-medium mb-0.5">Reason:</p>
            <p className="text-red-600 text-sm">Face not matched</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: `${result.match_score * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Match score: {(result.match_score * 100).toFixed(0)}% 
          </p>

          <div className="bg-gray-50 rounded-lg p-3 text-left">
            <p className="text-xs font-medium mb-1">Tips for better results:</p>
            <ul className="text-xs text-gray-600 space-y-0.5">
              <li>• Ensure good lighting on your face</li>
              <li>• Remove glasses if wearing any</li>
              <li>• Face the camera directly</li>
              <li>• Avoid shadows on your face</li>
            </ul>
          </div>

          {result.can_retry ? (
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          ) : null}

          <button
            onClick={() => window.location.href = "mailto:support@visapoc.com"}
            className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Contact Support
          </button>
        </div>
      );
    }
    
    return null;
  };

  const renderError = () => (
    <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col items-center gap-3">
        <XCircle className="h-10 w-10 text-red-500" />
        <div className="text-center">
          <p className="text-base font-bold text-red-700">Something Went Wrong</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
      <button
        onClick={handleRetry}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );

  const stepSubtitles = {
    loading_models: "Preparing AI face detection models...",
    extracting_passport_face: "Analyzing your passport photo...",
    liveness_challenge: "Complete the liveness check to prove you are real.",
    capturing_selfie: "Take a clear selfie for identity verification.",
    processing: "Comparing your face with passport photo...",
    result: "Face verification complete.",
  };

  return (
    <>
      <StepProgress current={6} />
      <SplitLayout
        image="/assets/face-verify-new.jpg"
        imageAlt="Facial recognition verification"
        eyebrow="Step 6"
        title="Face Verification"
        subtitle={stepSubtitles[step] || "Verify your identity."}
        rightPanel={webcamPanel}
      >
        <div className="mb-4 flex">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            ← Back
          </button>
        </div>
        
        {error
          ? renderError()
          : step === "loading_models"
          ? renderLoadingModels()
          : step === "extracting_passport_face"
          ? renderExtractingPassport()
          : step === "liveness_challenge"
          ? renderLivenessChallenge()
          : step === "capturing_selfie"
          ? renderCapturingSelfie()
          : step === "processing"
          ? renderProcessing()
          : step === "result"
          ? renderResult()
          : null}
      </SplitLayout>
    </>
  );
}
