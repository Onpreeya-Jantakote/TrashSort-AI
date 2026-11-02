"use client";

import { useEffect, useRef, useState } from "react";

export interface UseWebcamOptions {
  onStreamingChange?: (isStreaming: boolean) => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useWebcam(options?: UseWebcamOptions): UseWebcamReturn {
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoRef = options?.videoRef || internalVideoRef;
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startCamera = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("Webcam access is not supported by this browser.");
      setIsLoading(false);
      return;
    }

    try {
      let stream: MediaStream;

      // Soft preference for 720p without strict facingMode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback to unconstrained video stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video play interrupted:", playErr);
        }
        setIsStreaming(true);
        options?.onStreamingChange?.(true);
      } else {
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("Camera access was denied. Please allow camera permissions in your browser.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMessage("No camera device found. Please verify your camera is connected.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setErrorMessage("Camera is currently in use by another application.");
        } else {
          setErrorMessage(`Unable to start camera: ${err.message}`);
        }
      } else {
        setErrorMessage("An unknown error occurred while starting the camera.");
      }
      setIsStreaming(false);
      options?.onStreamingChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    options?.onStreamingChange?.(false);
  };

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
