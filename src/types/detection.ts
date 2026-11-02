// Supported waste categories matching our 4 colored bins
export type WasteCategoryType = "general" | "recycle" | "organic" | "hazardous";

// Bounding box coordinates: [x, y, width, height] in pixels
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Single detected object prediction from YOLO model
export interface DetectionResult {
  box: BoundingBox;
  label: string;
  confidence: number; // Value between 0.0 and 1.0 (e.g. 0.85 = 85%)
  category: WasteCategoryType;
  color: string; // Hex or CSS color for drawing the box (e.g. "#eab308")
}

// Status of the AI model lifecycle
export type ModelStatus = "idle" | "loading" | "ready" | "error";
