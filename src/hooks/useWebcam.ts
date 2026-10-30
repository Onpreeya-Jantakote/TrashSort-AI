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

export function useWebcam(options?: UseWebcamOptions): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startCamera = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("เบราว์เซอร์นี้ไม่รองรับการเปิดกล้องเว็บแคม");
      setIsLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsStreaming(true);
        options?.onStreamingChange?.(true);
      } else {
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("คุณปฏิเสธการเข้าถึงกล้อง กรุณาอนุญาตสิทธิ์การใช้กล้องในเบราว์เซอร์");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMessage("ไม่พบอุปกรณ์กล้องบนคอมพิวเตอร์หรือมือถือของคุณ");
        } else {
          setErrorMessage(`ไม่สามารถเปิดกล้องได้: ${err.message}`);
        }
      } else {
        setErrorMessage("เกิดข้อผิดพลาดในการเปิดกล้อง");
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
