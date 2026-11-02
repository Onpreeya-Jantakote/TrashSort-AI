import * as ort from "onnxruntime-web";
import type { DetectionResult } from "@/types/detection";
import { COCO_CLASSES, WASTE_MODEL_CLASSES, getWasteInfo, getDisplayLabel } from "./labels";
import { MODEL_INPUT_SIZE } from "./preprocessing";

export const DEFAULT_CONFIDENCE_THRESHOLD = 0.35;
export const DEFAULT_IOU_THRESHOLD = 0.45;

interface CandidateBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
}

export function calculateIoU(boxA: CandidateBox, boxB: CandidateBox): number {
  const x1 = Math.max(boxA.x, boxB.x);
  const y1 = Math.max(boxA.y, boxB.y);
  const x2 = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const y2 = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const unionArea = boxA.width * boxA.height + boxB.width * boxB.height - intersectionArea;

  if (unionArea <= 0) return 0;
  return intersectionArea / unionArea;
}

export function applyNMS(
  candidates: CandidateBox[],
  iouThreshold: number = DEFAULT_IOU_THRESHOLD
): CandidateBox[] {
  const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence);
  const selected: CandidateBox[] = [];

  for (const currentBox of sorted) {
    let shouldKeep = true;

    for (const chosenBox of selected) {
      if (currentBox.classId === chosenBox.classId) {
        if (calculateIoU(currentBox, chosenBox) > iouThreshold) {
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

export function postprocessYOLO(
  outputTensor: ort.Tensor,
  originalWidth: number,
  originalHeight: number,
  confidenceThreshold: number = DEFAULT_CONFIDENCE_THRESHOLD,
  iouThreshold: number = DEFAULT_IOU_THRESHOLD
): DetectionResult[] {
  const data = outputTensor.data as Float32Array;
  const [, numChannels, numAnchors] = outputTensor.dims;

  const numClasses = numChannels - 4;
  const candidates: CandidateBox[] = [];

  const scaleX = originalWidth / MODEL_INPUT_SIZE;
  const scaleY = originalHeight / MODEL_INPUT_SIZE;

  for (let i = 0; i < numAnchors; i++) {
    let maxScore = -Infinity;
    let bestClassId = -1;

    for (let c = 0; c < numClasses; c++) {
      // YOLO tensor layout: data[(4 + c) * numAnchors + anchorIndex]
      const score = data[(4 + c) * numAnchors + i];
      if (score > maxScore) {
        maxScore = score;
        bestClassId = c;
      }
    }

    if (maxScore < confidenceThreshold) {
      continue;
    }

    const cx = data[0 * numAnchors + i];
    const cy = data[1 * numAnchors + i];
    const w = data[2 * numAnchors + i];
    const h = data[3 * numAnchors + i];

    // Convert center format [cx, cy, w, h] to top-left format [x, y, w, h] and scale
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

  const filteredBoxes = applyNMS(candidates, iouThreshold);
  const classList = numClasses === 6 ? WASTE_MODEL_CLASSES : COCO_CLASSES;

  return filteredBoxes.map((candidate) => {
    const rawLabel = classList[candidate.classId] || `Class ${candidate.classId}`;
    const wasteInfo = getWasteInfo(rawLabel);
    const displayLabel = getDisplayLabel(rawLabel);

    return {
      box: {
        x: Math.round(candidate.x),
        y: Math.round(candidate.y),
        width: Math.round(candidate.width),
        height: Math.round(candidate.height),
      },
      label: displayLabel,
      confidence: Math.round(candidate.confidence * 100) / 100,
      category: wasteInfo.category,
      color: wasteInfo.color,
    };
  });
}
