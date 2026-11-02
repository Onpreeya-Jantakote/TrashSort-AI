import * as ort from "onnxruntime-web";

export const MODEL_INPUT_SIZE = 640;

export interface PreprocessedData {
  tensor: ort.Tensor;
  originalWidth: number;
  originalHeight: number;
}

/**
 * Preprocess image or video element for YOLO model:
 * 1. Read source dimensions (width and height)
 * 2. Draw and resize source onto a 640x640 offscreen canvas
 * 3. Extract RGBA pixel data
 * 4. Normalize values from [0, 255] to [0.0, 1.0]
 * 5. Convert to NCHW format: [1, 3, 640, 640] Float32 tensor
 */
export function prepareInputTensor(
  source: HTMLVideoElement | HTMLImageElement
): PreprocessedData {
  // Get actual dimensions of input source
  let originalWidth = 0;
  let originalHeight = 0;

  if (source instanceof HTMLVideoElement) {
    originalWidth = source.videoWidth;
    originalHeight = source.videoHeight;
  } else {
    originalWidth = source.naturalWidth;
    originalHeight = source.naturalHeight;
  }

  // Safety check: ensure source has loaded dimensions
  if (originalWidth === 0 || originalHeight === 0) {
    throw new Error("Input source has invalid dimensions. Make sure video or image is loaded.");
  }

  // Create an off-screen canvas to resize image to 640x640
  const canvas = document.createElement("canvas");
  canvas.width = MODEL_INPUT_SIZE;
  canvas.height = MODEL_INPUT_SIZE;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Failed to get 2D canvas context for preprocessing");
  }

  // Draw and resize input image/video into 640x640 canvas
  ctx.drawImage(source, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);

  // Extract pixel data: [R, G, B, A, R, G, B, A, ...]
  const imageData = ctx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const { data } = imageData;

  // Prepare Float32Array for tensor with shape [1, 3, 640, 640]
  // Total elements = 1 * 3 * 640 * 640 = 1,228,800 float numbers
  const numPixels = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;
  const float32Data = new Float32Array(3 * numPixels);

  // Pointers for Red, Green, and Blue color channels (NCHW format)
  // Channel 0 (Red) starts at index 0
  // Channel 1 (Green) starts after all red pixels
  // Channel 2 (Blue) starts after all green pixels
  const rOffset = 0;
  const gOffset = numPixels;
  const bOffset = numPixels * 2;

  for (let i = 0; i < numPixels; i++) {
    const pixelIndex = i * 4; // Each pixel has 4 values (R, G, B, A)

    // Normalize from [0, 255] to [0.0, 1.0]
    float32Data[rOffset + i] = data[pixelIndex] / 255.0; // Red
    float32Data[gOffset + i] = data[pixelIndex + 1] / 255.0; // Green
    float32Data[bOffset + i] = data[pixelIndex + 2] / 255.0; // Blue
  }

  // Create ONNX Tensor with shape: [Batch=1, Channels=3, Height=640, Width=640]
  const tensor = new ort.Tensor("float32", float32Data, [
    1,
    3,
    MODEL_INPUT_SIZE,
    MODEL_INPUT_SIZE,
  ]);

  return {
    tensor,
    originalWidth,
    originalHeight,
  };
}
