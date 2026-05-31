import { useState, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";

/**
 * Custom hook for face-api.js operations.
 * Loads models, provides face detection / comparison / liveness helpers.
 */
export function useFaceApi() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all required models on mount
  useEffect(() => {
    let cancelled = false;

    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) {
          setModelsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load face detection models:", err);
        if (!cancelled) {
          setError("Failed to load face detection models");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadModels();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Calculate pixel distance between two points.
   */
  const distance = useCallback((p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  /**
   * Eye aspect ratio for blink detection.
   * Low EAR (< 0.25) indicates a blink.
   */
  const eyeAspectRatio = useCallback(
    (eye) => {
      const A = distance(eye[1], eye[5]);
      const B = distance(eye[2], eye[4]);
      const C = distance(eye[0], eye[3]);
      return (A + B) / (2.0 * C);
    },
    [distance]
  );

  /**
   * Extract face descriptor from a passport image URL.
   * Returns Float32Array descriptor or null if no face found.
   */
  const extractPassportFace = useCallback(async (imageUrl) => {
    try {
      const img = await faceapi.fetchImage(imageUrl);
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!detection) return null;
      return detection.descriptor;
    } catch (err) {
      console.error("Failed to extract passport face:", err);
      return null;
    }
  }, []);

  /**
   * Compare two face descriptors.
   * Returns { score: 0-1 (higher = better match), distance: euclidean distance }
   */
  const compareFaces = useCallback((descriptor1, descriptor2) => {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);

    // Standard practical threshold
    const THRESHOLD = 0.48;

    let result = {
      verified: false,
      confidence: 0,
      distance: distance
    };

    if (distance < THRESHOLD) {
      result.verified = true;
      // If it passes, give a nicely scaled high score between 82% and 99%
      result.confidence = 0.99 - ((distance / THRESHOLD) * 0.17);
    } else {
      result.verified = false;
      // If it fails, give a lower score
      result.confidence = Math.max(0.1, 0.75 - ((distance - THRESHOLD) * 1.2));
    }

    console.log({
      distance,
      verified: result.verified,
      confidence: result.confidence * 100
    });
    
    return { score: result.confidence, distance: distance, verified: result.verified };
  }, []);

  /**
   * Detect blink from face landmarks.
   * Returns true if eyes are closed (EAR below threshold).
   */
  const detectBlink = useCallback(
    (landmarks) => {
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const leftEAR = eyeAspectRatio(leftEye);
      const rightEAR = eyeAspectRatio(rightEye);
      return (leftEAR + rightEAR) / 2 < 0.28;
    },
    [eyeAspectRatio]
  );

  /**
   * Calculate pixel motion difference between two base64 frame images.
   * Returns a number 0-255 representing average pixel difference.
   */
  const calculateMotion = useCallback(async (frame1, frame2) => {
    return new Promise((resolve) => {
      const img1 = new Image();
      const img2 = new Image();
      let loaded = 0;

      const onBothLoaded = () => {
        loaded++;
        if (loaded < 2) return;

        const canvas = document.createElement("canvas");
        const w = Math.min(img1.width, img2.width, 320);
        const h = Math.min(img1.height, img2.height, 240);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        // Draw frame1
        ctx.drawImage(img1, 0, 0, w, h);
        const data1 = ctx.getImageData(0, 0, w, h).data;

        // Draw frame2
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img2, 0, 0, w, h);
        const data2 = ctx.getImageData(0, 0, w, h).data;

        // Calculate average pixel difference
        let totalDiff = 0;
        const pixelCount = w * h;
        for (let i = 0; i < data1.length; i += 4) {
          const rDiff = Math.abs(data1[i] - data2[i]);
          const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
          const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);
          totalDiff += (rDiff + gDiff + bDiff) / 3;
        }

        resolve(totalDiff / pixelCount);
      };

      img1.onload = onBothLoaded;
      img2.onload = onBothLoaded;
      img1.src = frame1;
      img2.src = frame2;
    });
  }, []);

  /**
   * Run full face detection on an image element or canvas.
   * Returns detection with landmarks, descriptor, and expressions.
   */
  const detectFace = useCallback(async (input) => {
    return await faceapi
      .detectSingleFace(input)
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withFaceExpressions();
  }, []);

  /**
   * Detect all faces in an input (for counting faces in frame).
   */
  const detectAllFaces = useCallback(async (input) => {
    return await faceapi
      .detectAllFaces(input)
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();
  }, []);

  return {
    modelsLoaded,
    loading,
    error,
    extractPassportFace,
    compareFaces,
    detectBlink,
    eyeAspectRatio,
    calculateMotion,
    detectFace,
    detectAllFaces,
  };
}
