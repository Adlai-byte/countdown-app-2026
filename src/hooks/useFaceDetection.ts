import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';

export interface FaceDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  landmarks?: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    nose: { x: number; y: number };
    mouth: { x: number; y: number };
    forehead: { x: number; y: number };
  };
}

interface UseFaceDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled?: boolean;
}

export function useFaceDetection({ videoRef, enabled = true }: UseFaceDetectionOptions) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faces, setFaces] = useState<FaceDetection[]>([]);
  const animationRef = useRef<number | null>(null);

  // Load face-api.js models
  useEffect(() => {
    if (!enabled) return;

    const loadModels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use CDN for models
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);

        setIsModelLoaded(true);
      } catch (err) {
        console.error('Failed to load face detection models:', err);
        setError('Failed to load face detection. AR filters may not work.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, [enabled]);

  // Detect faces in video stream
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !isModelLoaded || !enabled) return;

    const video = videoRef.current;
    if (video.paused || video.ended || video.readyState < 2) return;

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.5,
        }))
        .withFaceLandmarks(true);

      const processedFaces: FaceDetection[] = detections.map((detection) => {
        const box = detection.detection.box;
        const landmarks = detection.landmarks;

        // Get key landmark points
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const nose = landmarks.getNose();
        const mouth = landmarks.getMouth();

        // Calculate center points
        const leftEyeCenter = {
          x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
          y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length,
        };

        const rightEyeCenter = {
          x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
          y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length,
        };

        const noseCenter = {
          x: nose[3].x, // Nose tip
          y: nose[3].y,
        };

        const mouthCenter = {
          x: mouth.reduce((sum, p) => sum + p.x, 0) / mouth.length,
          y: mouth.reduce((sum, p) => sum + p.y, 0) / mouth.length,
        };

        // Estimate forehead position (above the eyes)
        const eyesCenterY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
        const eyesCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
        const foreheadY = eyesCenterY - box.height * 0.3;

        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          landmarks: {
            leftEye: leftEyeCenter,
            rightEye: rightEyeCenter,
            nose: noseCenter,
            mouth: mouthCenter,
            forehead: { x: eyesCenterX, y: foreheadY },
          },
        };
      });

      setFaces(processedFaces);
    } catch (err) {
      console.error('Face detection error:', err);
    }

    // Continue detection loop at ~15fps
    animationRef.current = requestAnimationFrame(() => {
      setTimeout(detectFaces, 66); // ~15fps
    });
  }, [videoRef, isModelLoaded, enabled]);

  // Start/stop detection loop
  useEffect(() => {
    if (!enabled || !isModelLoaded) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setFaces([]);
      return;
    }

    detectFaces();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [enabled, isModelLoaded, detectFaces]);

  return {
    faces,
    isModelLoaded,
    isLoading,
    error,
  };
}
