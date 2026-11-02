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

const PRIMARY_MODEL_PATH = "/models/waste_yolov8n.onnx";
const FALLBACK_MODEL_PATH = "/models/yolov8n.onnx";

export function useYoloModel(options?: UseYoloModelOptions): UseYoloModelReturn {
  const modelPath = options?.modelPath || PRIMARY_MODEL_PATH;
  const confidenceThreshold = options?.confidenceThreshold;
  const iouThreshold = options?.iouThreshold;

  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionRef = useRef<ort.InferenceSession | null>(null);
  const isDetectingRef = useRef<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    const loadModel = async () => {
      setModelStatus("loading");
      setErrorMessage(null);

      try {
        ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.1/dist/";
        ort.env.wasm.numThreads = 1; // 1 thread avoids COOP/COEP header restrictions

        let session: ort.InferenceSession;
        try {
          session = await ort.InferenceSession.create(modelPath, {
            executionProviders: ["wasm"],
          });
        } catch (primaryErr) {
          if (modelPath === PRIMARY_MODEL_PATH) {
            console.warn(`Primary model ${PRIMARY_MODEL_PATH} not found, falling back to ${FALLBACK_MODEL_PATH}`);
            session = await ort.InferenceSession.create(FALLBACK_MODEL_PATH, {
              executionProviders: ["wasm"],
            });
          } else {
            throw primaryErr;
          }
        }

        if (!isCancelled) {
          sessionRef.current = session;
          setModelStatus("ready");
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

    return () => {
      isCancelled = true;
      if (sessionRef.current) {
        sessionRef.current = null;
      }
    };
  }, [modelPath]);

  const runInference = useCallback(
    async (source: HTMLVideoElement | HTMLImageElement): Promise<DetectionResult[]> => {
      if (!sessionRef.current || modelStatus !== "ready" || isDetectingRef.current) {
        return [];
      }

      isDetectingRef.current = true;

      try {
        const { tensor, originalWidth, originalHeight } = prepareInputTensor(source);

        const inputName = sessionRef.current.inputNames[0];
        const feeds: Record<string, ort.Tensor> = {
          [inputName]: tensor,
        };

        const outputs = await sessionRef.current.run(feeds);
        const outputName = sessionRef.current.outputNames[0];
        const outputTensor = outputs[outputName];

        return postprocessYOLO(
          outputTensor,
          originalWidth,
          originalHeight,
          confidenceThreshold,
          iouThreshold
        );
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
