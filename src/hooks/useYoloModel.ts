"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as ort from "onnxruntime-web";
import type { DetectionResult, ModelStatus } from "@/types/detection";
import { prepareInputTensor } from "@/lib/yolo/preprocessing";
import { postprocessYOLO } from "@/lib/yolo/postprocessing";

export interface UseYoloModelOptions {
  modelPath?: string;
  confidenceThreshold?: number;
  iouThreshold?: number;
}

export interface UseYoloModelReturn {
  modelStatus: ModelStatus;
  errorMessage: string | null;
  runInference: (source: HTMLVideoElement | HTMLImageElement) => Promise<DetectionResult[]>;
  isModelReady: boolean;
}

const DEFAULT_MODEL_PATH = "/models/yolov8n.onnx";

/**
 * Custom Hook to manage YOLO ONNX model lifecycle and inference
 */
export function useYoloModel(options?: UseYoloModelOptions): UseYoloModelReturn {
  const modelPath = options?.modelPath || DEFAULT_MODEL_PATH;
  const confidenceThreshold = options?.confidenceThreshold;
  const iouThreshold = options?.iouThreshold;

  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store ONNX inference session in Ref so it persists without re-rendering
  const sessionRef = useRef<ort.InferenceSession | null>(null);

  // Flag to prevent overlapping inference calls on consecutive frames
  const isDetectingRef = useRef<boolean>(false);

  // Load ONNX model session on mount
  useEffect(() => {
    let isCancelled = false;

    const loadModel = async () => {
      setModelStatus("loading");
      setErrorMessage(null);

      try {
        // Configure WebAssembly backend path to official CDN
        // This allows downloading required wasm binaries seamlessly in browser
        ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.1/dist/";
        ort.env.wasm.numThreads = 1; // 1 thread avoids Cross-Origin-Opener-Policy restrictions

        // Create inference session
        const session = await ort.InferenceSession.create(modelPath, {
          executionProviders: ["wasm"],
        });

        if (!isCancelled) {
          sessionRef.current = session;
          setModelStatus("ready");
          console.log("YOLO model loaded successfully:", modelPath);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("Failed to load YOLO model:", err);
          setModelStatus("error");
          if (err instanceof Error) {
            setErrorMessage(`Failed to load AI model: ${err.message}`);
          } else {
            setErrorMessage("Failed to load AI model file.");
          }
        }
      }
    };

    loadModel();

    // Cleanup when component unmounts
    return () => {
      isCancelled = true;
      if (sessionRef.current) {
        sessionRef.current = null;
      }
    };
  }, [modelPath]);

  /**
   * Run object detection on an image or video frame
   */
  const runInference = useCallback(
    async (source: HTMLVideoElement | HTMLImageElement): Promise<DetectionResult[]> => {
      // If model is not loaded yet or already busy with previous frame, skip
      if (!sessionRef.current || modelStatus !== "ready") {
        return [];
      }

      if (isDetectingRef.current) {
        // Skip this frame to avoid UI freezing
        return [];
      }

      isDetectingRef.current = true;

      try {
        // 1. Preprocess: resize to 640x640 and convert to NCHW Float32 tensor
        const { tensor, originalWidth, originalHeight } = prepareInputTensor(source);

        // 2. Build input feeds using model's input layer name
        const inputName = sessionRef.current.inputNames[0];
        const feeds: Record<string, ort.Tensor> = {
          [inputName]: tensor,
        };

        // 3. Run inference with ONNX Runtime Web
        const outputs = await sessionRef.current.run(feeds);

        // 4. Postprocess: extract predictions, filter confidence, run NMS
        const outputName = sessionRef.current.outputNames[0];
        const outputTensor = outputs[outputName];

        const detections = postprocessYOLO(
          outputTensor,
          originalWidth,
          originalHeight,
          confidenceThreshold,
          iouThreshold
        );

        return detections;
      } catch (err: unknown) {
        console.error("Inference error:", err);
        return [];
      } finally {
        isDetectingRef.current = false;
      }
    },
    [modelStatus, confidenceThreshold, iouThreshold]
  );

  return {
    modelStatus,
    errorMessage,
    runInference,
    isModelReady: modelStatus === "ready",
  };
}
