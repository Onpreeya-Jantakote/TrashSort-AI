# TrashSort AI

An in-browser computer vision web application designed for real-time waste classification and educational sorting assistance. Powered by Next.js, WebAssembly, and a custom-trained YOLOv8 model via ONNX Runtime Web.

> **Project Status:** Active Development  
> This project is currently under continuous active development. Features, model weights, and performance optimizations are being iterated regularly.

---

## Overview

TrashSort AI runs object detection entirely on the client side inside the user's browser. Images and video feeds are processed locally without sending sensitive camera data or images to external servers, ensuring user privacy and zero server inference overhead.

The detection pipeline maps detected items to standard Thai 4-color waste sorting bins:
- **Recycle (Yellow):** Plastic, glass, metal, paper, and cardboard containers.
- **Organic / Wet Waste (Green):** Biodegradable food waste, peels, and organic scraps.
- **General Waste (Blue):** Non-recyclable packaging, wrappers, and composite materials.
- **Hazardous Waste (Red):** Batteries, electronic components, and chemical containers.

---

## How It Works:

This project serves as a practical, open-source reference for learning in-browser computer vision and machine learning engineering. The system is built around three core pillars:

### 1. Dataset Provenance & Curation
- **Source:** The model was trained on the open-source Garbage Classification dataset curated by Kerem Berke via Hugging Face (`keremberke/garbage-object-detection`), originally derived from Roboflow Universe.
- **Volume:** Comprises **9,422 real-world waste images** and **70,527 annotated objects**, capturing crushed, crumpled, and varied lighting conditions.
- **Partitioning:**
  - **Training Set (7,324 images / 51,611 annotations):** Used by YOLOv8 to learn object geometry, color distributions, and surface textures.
  - **Validation Set (2,098 images / 18,916 annotations):** Held-out partition used to benchmark detection precision without bias.

### 2. Annotation Transformation (COCO to YOLO)
- **Problem:** The raw dataset provided bounding boxes in standard COCO format: `[x_min, y_min, width, height]` in absolute pixel values. Pixel values cannot generalize across cameras with varying resolutions (e.g., 4K phone vs. 720p webcam).
- **Solution:** Our preparation script (`training/prepare_dataset.py`) converts all annotations to normalized YOLO coordinates:
  ```text
  x_center = (x_min + box_width / 2) / image_width
  y_center = (y_min + box_height / 2) / image_height
  norm_w   = box_width / image_width
  norm_h   = box_height / image_height
  ```
  Each bounding box is stored as `<class_id> <x_center> <y_center> <width> <height>` with values strictly bounded between `0.0` and `1.0`.

### 3. Classification & Educational Bin Mapping
The model detects 6 specific target classes and maps them to appropriate disposal categories:

| Class ID | Target Class | Material Type | Assigned Bin | Bin Color |
| :--- | :--- | :--- | :--- | :--- |
| `0` | `biodegradable` | Food scraps, fruit peels, biological waste | Organic (ขยะเปียก) | Green |
| `1` | `cardboard` | Corrugated boxes, parcel packaging | Recycle (รีไซเคิล) | Yellow |
| `2` | `glass` | Glass bottles, jars, glassware | Recycle (รีไซเคิล) | Yellow |
| `3` | `metal` | Aluminum cans, tin cans, foil | Recycle (รีไซเคิล) | Yellow |
| `4` | `paper` | Office paper, notebooks, envelopes | Recycle (รีไซเคิล) | Yellow |
| `5` | `plastic` | PET bottles, HDPE containers | Recycle (รีไซเคิล) | Yellow |

---

## Key Features

- **Client-Side AI Inference:** Runs YOLOv8 models directly in the browser using WebAssembly (`onnxruntime-web`), requiring no dedicated backend inference servers.
- **Dual Input Modes:**
  - **Live Camera Stream:** Real-time WebRTC frame sampling with rate limiting to maintain browser responsiveness.
  - **Image Upload:** Drag-and-drop file upload with in-memory preview and memory management (`URL.revokeObjectURL`).
- **Responsive Visual Feedback:** SVG-based bounding box overlay with dynamic bilingual badges (Thai and English) and reactive visual card highlights on matching waste bins.
- **Graceful Fallbacks:** Multi-stage camera constraint fallbacks and model loading fallbacks to ensure interface stability across diverse environments.

---

## System Architecture

The computer vision pipeline operates in five distinct phases:

```text
[Input Source]
  ├── Live Video (Webcam / WebRTC)
  └── Uploaded Image (File / Drag-and-drop)
         │
         ▼
[1. Preprocessing]
  └── Resize to 640x640 offscreen canvas, normalize RGB [0.0, 1.0], convert to Float32 NCHW tensor
         │
         ▼
[2. Inference Session]
  └── ONNX Runtime Web (WebAssembly single-threaded execution)
         │
         ▼
[3. Postprocessing]
  └── Dynamic tensor extraction, confidence thresholding, and Non-Maximum Suppression (NMS)
         │
         ▼
[4. Output Presentation]
  ├── Responsive SVG DetectionOverlay (Bounding boxes & bilingual labels)
  └── Reactive Educational Bin Cards (Dynamic highlight & pulse animation)
```

---

## Best Practices for Testing

- **Motion Stability:** YOLO performs frame-by-frame inference without temporal memory. Rapid movement introduces motion blur; holding objects steady for 0.5s yields optimal confidence scores.
- **Lighting Conditions:** Highly reflective surfaces (such as clear glass or translucent plastic) require adequate ambient light to expose distinct material edges.
- **Upload Mode for Complex Scenes:** For multi-item clutter or high-resolution inspection, image upload mode bypasses real-time camera compression.

---

## Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **UI Library:** React, Tailwind CSS
- **Language:** TypeScript (Strict typing enabled)
- **Runtime AI:** ONNX Runtime Web (`onnxruntime-web`)
- **Model Training:** Python, Ultralytics YOLOv8, PyTorch (CUDA acceleration)
- **Typography:** TH Sarabun (`next/font/google`)

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/trash-sort-ai.git
   cd trash-sort-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Building for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

---

## Model Training & Export

The project includes an end-to-end Python pipeline under the `training/` directory for preparing datasets and training YOLOv8 models locally:

1. **Dataset Preparation:**
   Downloads curated waste detection data and converts annotations to normalized YOLO format:
   ```bash
   python training/prepare_dataset.py
   ```

2. **GPU Model Training & ONNX Export:**
   Trains `yolov8n` with PyTorch CUDA acceleration and automatically exports the best checkpoint to `public/models/waste_yolov8n.onnx`:
   ```bash
   python training/train.py
   ```

---

## License

This project is open-source and available under the [MIT License](LICENSE).
