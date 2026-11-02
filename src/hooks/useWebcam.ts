"use client";

import { useEffect, useRef, useState } from "react";

export interface UseWebcamOptions {
  onStreamingChange?: (isStreaming: boolean) => void;
}

export interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

/**
 * Custom Hook to control webcam stream using WebRTC MediaDevices API
 */
export function useWebcam(options?: UseWebcamOptions): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Start webcam video stream
  const startCamera = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Check if browser supports camera API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("Your browser does not support webcam access.");
      setIsLoading(false);
      return;
    }

    try {
      // Request camera stream from browser
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // Prefer back camera on phones
        },
        audio: false, // We only need video, no audio
      });

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsStreaming(true);
        options?.onStreamingChange?.(true);
      } else {
        // If component unmounted before camera opened, stop track immediately
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("Camera access was denied. Please allow camera permissions in browser.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMessage("No camera device found on this computer or phone.");
        } else {
          setErrorMessage(`Unable to start camera: ${err.message}`);
        }
      } else {
        setErrorMessage("An unknown error occurred while opening camera.");
      }
      setIsStreaming(false);
      options?.onStreamingChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop camera and turn off hardware light
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      // Stop all tracks to turn off camera
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    options?.onStreamingChange?.(false);
  };

  // Stop camera automatically when user leaves or switches tabs
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    isStreaming,
    isLoading,
    errorMessage,
    startCamera,
    stopCamera,
  };
}
