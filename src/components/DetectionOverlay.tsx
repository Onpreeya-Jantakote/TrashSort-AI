"use client";

import type { DetectionResult } from "@/types/detection";

interface DetectionOverlayProps {
  detections: DetectionResult[];
  sourceWidth: number;
  sourceHeight: number;
}

/**
 * SVG Overlay component to render YOLO bounding boxes and labels.
 * Uses SVG viewBox to automatically scale boxes to match container size.
 */
export default function DetectionOverlay({
  detections,
  sourceWidth,
  sourceHeight,
}: DetectionOverlayProps) {
  // If there are no detections or invalid dimensions, render nothing
  if (detections.length === 0 || sourceWidth === 0 || sourceHeight === 0) {
    return null;
  }

  return (
    <svg
      viewBox={`0 0 ${sourceWidth} ${sourceHeight}`}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      preserveAspectRatio="none"
    >
      {detections.map((detection, index) => {
        const { box, label, confidence, color } = detection;
        const confidencePercent = Math.round(confidence * 100);
        const tagText = `${label} (${confidencePercent}%)`;

        // Estimate label background badge size based on text length
        const badgeWidth = Math.max(tagText.length * 10 + 16, 80);
        const badgeHeight = 24;

        // Ensure badge stays within top boundaries
        const badgeY = box.y >= badgeHeight ? box.y - badgeHeight : box.y;

        return (
          <g key={`${label}-${box.x}-${box.y}-${index}`}>
            {/* Bounding Box Rectangle */}
            <rect
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              fill="none"
              stroke={color}
              strokeWidth={Math.max(2, Math.round(sourceWidth / 400))}
              strokeDasharray="4 2"
              className="transition-all duration-150"
            />

            {/* Label Background Badge */}
            <rect
              x={box.x}
              y={badgeY}
              width={badgeWidth}
              height={badgeHeight}
              fill={color}
              rx={4}
            />

            {/* Label Text */}
            <text
              x={box.x + 8}
              y={badgeY + 16}
              fill="#ffffff"
              fontSize={14}
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {tagText}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
