import * as ort from "onnxruntime-web";
import type { DetectionResult } from "@/types/detection";
import { COCO_CLASSES, getWasteInfo } from "./labels";
import { MODEL_INPUT_SIZE } from "./preprocessing";

// Default thresholds for detection
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.35; // 35% minimum confidence
export const DEFAULT_IOU_THRESHOLD = 0.45; // 45% box overlap limit for NMS

interface CandidateBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
}

/**
 * Calculate Intersection over Union (IoU) between two bounding boxes.
 * Returns a value between 0.0 (no overlap) and 1.0 (exact same box).
 */
export function calculateIoU(boxA: CandidateBox, boxB: CandidateBox): number {
  const x1 = Math.max(boxA.x, boxB.x);
  const y1 = Math.max(boxA.y, boxB.y);
  const x2 = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const y2 = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const intersectionWidth = Math.max(0, x2 - x1);
  const intersectionHeight = Math.max(0, y2 - y1);
  const intersectionArea = intersectionWidth * intersectionHeight;

  const areaA = boxA.width * boxA.height;
  const areaB = boxB.width * boxB.height;
  const unionArea = areaA + areaB - intersectionArea;

  if (unionArea <= 0) return 0;
  return intersectionArea / unionArea;
}

/**
 * Non-Maximum Suppression (NMS):
 * Removes duplicate overlapping boxes predicting the same object.
 */
export function applyNMS(
  candidates: CandidateBox[],
  iouThreshold: number = DEFAULT_IOU_THRESHOLD
): CandidateBox[] {
  // Sort boxes from highest confidence to lowest
  const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence);
  const selected: CandidateBox[] = [];

  for (const currentBox of sorted) {
    let shouldKeep = true;

    for (const chosenBox of selected) {
      // Only compare boxes of the same class
      if (currentBox.classId === chosenBox.classId) {
        const iou = calculateIoU(currentBox, chosenBox);
        if (iou > iouThreshold) {
          // Boxes overlap too much, ignore the lower confidence one
          shouldKeep = false;
          break;
        }
      }
    }

    if (shouldKeep) {
      selected.push(currentBox);
    }
  }

  return selected;
}

/**
 * Postprocess raw YOLO output tensor:
 * 1. Read predictions: shape [1, 84, 8400]
 * 2. Filter boxes by confidence threshold
 * 3. Convert coordinates from center [cx, cy, w, h] to top-left [x, y, w, h]
 * 4. Scale coordinates back to original image/video dimensions
 * 5. Run NMS to remove duplicates
 * 6. Map class IDs to labels and waste categories
 */
export function postprocessYOLO(
  outputTensor: ort.Tensor,
  originalWidth: number,
  originalHeight: number,
  confidenceThreshold: number = DEFAULT_CONFIDENCE_THRESHOLD,
  iouThreshold: number = DEFAULT_IOU_THRESHOLD
): DetectionResult[] {
  const data = outputTensor.data as Float32Array;
  const [, numChannels, numAnchors] = outputTensor.dims; // [1, 84, 8400]

  const numClasses = numChannels - 4; // 84 - 4 = 80 classes
  const candidates: CandidateBox[] = [];

  // Calculate scale factors to convert 640x640 back to original size
  const scaleX = originalWidth / MODEL_INPUT_SIZE;
  const scaleY = originalHeight / MODEL_INPUT_SIZE;

  // Loop through all 8400 candidate boxes
  for (let i = 0; i < numAnchors; i++) {
    // Find the class with the highest probability score for this box
    let maxScore = -Infinity;
    let bestClassId = -1;

    for (let c = 0; c < numClasses; c++) {
      // Data in YOLO tensor is stored channel by channel: data[channel * numAnchors + anchorIndex]
      const score = data[(4 + c) * numAnchors + i];
      if (score > maxScore) {
        maxScore = score;
        bestClassId = c;
      }
    }

    // Ignore boxes with low confidence score
    if (maxScore < confidenceThreshold) {
      continue;
    }

    // Read box center coordinates and dimensions
    const cx = data[0 * numAnchors + i];
    const cy = data[1 * numAnchors + i];
    const w = data[2 * numAnchors + i];
    const h = data[3 * numAnchors + i];

    // Convert center [cx, cy, w, h] to top-left corner [x, y, w, h]
    // and scale up to original image dimensions
    const x = Math.max(0, (cx - w / 2) * scaleX);
    const y = Math.max(0, (cy - h / 2) * scaleY);
    const width = Math.min(originalWidth - x, w * scaleX);
    const height = Math.min(originalHeight - y, h * scaleY);

    candidates.push({
      x,
      y,
      width,
      height,
      confidence: maxScore,
      classId: bestClassId,
    });
  }

  // Remove duplicate boxes using Non-Maximum Suppression (NMS)
  const filteredBoxes = applyNMS(candidates, iouThreshold);

  // Map each box to final DetectionResult format
  return filteredBoxes.map((candidate) => {
    const label = COCO_CLASSES[candidate.classId] || `Class ${candidate.classId}`;
    const wasteInfo = getWasteInfo(label);

    return {
      box: {
        x: Math.round(candidate.x),
        y: Math.round(candidate.y),
        width: Math.round(candidate.width),
        height: Math.round(candidate.height),
      },
      label,
      confidence: Math.round(candidate.confidence * 100) / 100, // Round to 2 decimals e.g. 0.85
      category: wasteInfo.category,
      color: wasteInfo.color,
    };
  });
}
