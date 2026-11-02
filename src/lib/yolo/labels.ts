import type { WasteCategoryType } from "@/types/detection";

export interface LabelInfo {
  name: string;
  category: WasteCategoryType;
  color: string; // Hex color for bounding box border
}

// Colors matching our 4 waste bin types
export const BIN_COLORS: Record<WasteCategoryType, string> = {
  recycle: "#eab308", // Yellow (Tailwind amber-500)
  organic: "#22c55e", // Green (Tailwind emerald-500)
  general: "#3b82f6", // Blue (Tailwind blue-500)
  hazardous: "#ef4444", // Red (Tailwind rose-500)
};

/**
 * Common object detection labels mapped to waste categories.
 * Standard COCO model labels that represent common household waste items.
 */
export const WASTE_LABEL_MAP: Record<string, { category: WasteCategoryType; color: string }> = {
  // Recyclable Waste (Yellow bin)
  bottle: { category: "recycle", color: BIN_COLORS.recycle },
  can: { category: "recycle", color: BIN_COLORS.recycle },
  cup: { category: "recycle", color: BIN_COLORS.recycle },
  glass: { category: "recycle", color: BIN_COLORS.recycle },
  paper: { category: "recycle", color: BIN_COLORS.recycle },
  box: { category: "recycle", color: BIN_COLORS.recycle },
  cardboard: { category: "recycle", color: BIN_COLORS.recycle },
  book: { category: "recycle", color: BIN_COLORS.recycle },

  // Organic / Wet Waste (Green bin)
  banana: { category: "organic", color: BIN_COLORS.organic },
  apple: { category: "organic", color: BIN_COLORS.organic },
  sandwich: { category: "organic", color: BIN_COLORS.organic },
  orange: { category: "organic", color: BIN_COLORS.organic },
  broccoli: { category: "organic", color: BIN_COLORS.organic },
  carrot: { category: "organic", color: BIN_COLORS.organic },
  pizza: { category: "organic", color: BIN_COLORS.organic },
  donut: { category: "organic", color: BIN_COLORS.organic },

  // General Waste (Blue bin)
  plastic: { category: "general", color: BIN_COLORS.general },
  bag: { category: "general", color: BIN_COLORS.general },
  wrapper: { category: "general", color: BIN_COLORS.general },
  fork: { category: "general", color: BIN_COLORS.general },
  knife: { category: "general", color: BIN_COLORS.general },
  spoon: { category: "general", color: BIN_COLORS.general },

  // Hazardous Waste (Red bin)
  battery: { category: "hazardous", color: BIN_COLORS.hazardous },
  electronics: { category: "hazardous", color: BIN_COLORS.hazardous },
  spray: { category: "hazardous", color: BIN_COLORS.hazardous },
};

/**
 * Standard 80 classes of COCO Dataset (used by base YOLOv8 / YOLO11 models)
 */
export const COCO_CLASSES: string[] = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
  "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
  "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack",
  "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball",
  "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
  "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
  "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair",
  "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse",
  "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator",
  "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
];

/**
 * Helper function: Get waste category and box color from class name
 */
export function getWasteInfo(className: string): { category: WasteCategoryType; color: string } {
  const normalized = className.toLowerCase().trim();

  // If label exists in our waste map, return its category
  if (WASTE_LABEL_MAP[normalized]) {
    return WASTE_LABEL_MAP[normalized];
  }

  // Default fallback: If item is unknown, treat as general waste
  return {
    category: "general",
    color: BIN_COLORS.general,
  };
}
