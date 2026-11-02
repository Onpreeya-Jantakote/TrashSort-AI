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

## Key Features

- **Client-Side AI Inference:** Runs YOLOv8 models directly in the browser using WebAssembly (`onnxruntime-web`), requiring no dedicated backend inference servers.
- **Dual Input Modes:**
  - **Live Camera Stream:** Real-time WebRTC frame sampling with rate limiting to maintain browser responsiveness.
  - **Image Upload:** Drag-and-drop file upload with in-memory preview and memory management (`URL.revokeObjectURL`).
- **Custom-Trained Waste Model:** Trained on over 9,400 curated waste items across 6 target classes (`biodegradable`, `cardboard`, `glass`, `metal`, `paper`, `plastic`).
- **Responsive Visual Feedback:** SVG-based bounding box overlay with dynamic bilingual badges and reactive visual card highlights on matching waste bins.
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
