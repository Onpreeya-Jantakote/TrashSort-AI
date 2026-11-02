# Project Status: TrashSort AI

## Project Overview
TrashSort AI is an educational web application designed to help users learn proper waste sorting in real-time using in-browser computer vision (Next.js + YOLO/ONNX Runtime Web).

---

## Current Phase: Phase 4 — Custom YOLO Waste Model Training & In-Browser Deployment (COMPLETED)

### Features Completed
- [x] Environment inspection (Node.js v24.22.0, npm v11.19.1, Git v2.55.0, Python v3.14.8).
- [x] Bootstrapped Next.js application with TypeScript, Tailwind CSS v4, ESLint, and App Router.
- [x] Verified production build (`npm run build`) runs cleanly without errors.
- [x] Initialized Git repository (`git init`).
- [x] Configured `.gitignore` for AI/ML files (weights, datasets, YOLO runs, Python venv) and agent notes.
- [x] Configured TH Sarabun font (`Sarabun` via `next/font/google`) in `src/app/layout.tsx` and `src/app/globals.css`.
- [x] Built the initial TrashSort AI App Shell in `src/app/page.tsx` with responsive layout, mode switcher tab (Webcam vs Upload), clean SVG icons, and educational waste sorting guide.
- [x] Extracted camera stream business logic into a reusable Custom Hook `useWebcam` (`src/hooks/useWebcam.ts`).
- [x] Refactored `WebcamView` component (`src/components/WebcamView.tsx`) to act as a focused presentational component consuming `useWebcam`.
- [x] Refactored waste category guidance to a typed configuration data array (`WASTE_CATEGORIES.map()`) in preparation for dynamic AI detection matching.
- [x] Created modular `ImageUploadView` component (`src/components/ImageUploadView.tsx`) with file picker, drag-and-drop support, type/size validation, fast preview using `URL.createObjectURL`, and memory leak cleanup (`URL.revokeObjectURL`).
- [x] Installed `onnxruntime-web` for in-browser client-side AI inference.
- [x] Created central detection types in `src/types/detection.ts` (`BoundingBox`, `DetectionResult`, `WasteCategoryType`, `ModelStatus`).
- [x] Built waste labels and color dictionary in `src/lib/yolo/labels.ts` mapping COCO and custom classes to the 4 waste bins.
- [x] Created preprocessing module `src/lib/yolo/preprocessing.ts` (canvas 640x640 resize, RGB normalization [0-1], NCHW Float32 tensor conversion).
- [x] Created postprocessing module `src/lib/yolo/postprocessing.ts` (confidence filtering, coordinate scaling, Non-Maximum Suppression / NMS).
- [x] Built `useYoloModel` hook (`src/hooks/useYoloModel.ts`) managing WebAssembly ONNX sessions and execution concurrency guards.
- [x] Created `DetectionOverlay` component (`src/components/DetectionOverlay.tsx`) using scalable SVG viewBox to render bounding boxes, confidence tags, and labels.
- [x] Integrated real-time detection on webcam (controlled 250ms interval) and on-demand detection on uploaded images.
- [x] Connected detection results to dynamically highlight and pulse matching waste bin cards in the educational guide.
- [x] Configured PyTorch with CUDA 12.6 acceleration on NVIDIA GeForce RTX 4050 Laptop GPU.
- [x] Built automated dataset preparation pipeline `training/prepare_dataset.py` (downloads 9,422 real waste images from Hugging Face, converts COCO annotations to YOLO format across 6 classes: `biodegradable`, `cardboard`, `glass`, `metal`, `paper`, `plastic`).
- [x] Trained custom YOLOv8n model (`training/train.py`) on GPU for 25 epochs with early stopping (Precision: 55.7%, mAP50: 50.3%).
- [x] Exported trained model to ONNX with `onnxslim` and opset 12 (`public/models/waste_yolov8n.onnx`, 12.7 MB).
- [x] Updated in-browser detection postprocessing and custom hook to load `waste_yolov8n.onnx` with graceful fallback and bilingual Thai/English badge translations.

### Files Created or Changed
- `src/types/detection.ts`: TypeScript interfaces for detection results, bounding boxes, and model status.
- `src/lib/yolo/labels.ts`: Waste category dictionary, bin colors, custom 6 waste classes, and Thai localization.
- `src/lib/yolo/preprocessing.ts`: Input image/video preprocessing into NCHW tensor `[1, 3, 640, 640]`.
- `src/lib/yolo/postprocessing.ts`: Adaptive tensor decoder (supports both 6-class custom and 80-class COCO models), IoU calculator, NMS deduplication, and coordinate scaler.
- `src/hooks/useYoloModel.ts`: Custom hook loading `waste_yolov8n.onnx` with fallback to base model.
- `src/components/DetectionOverlay.tsx`: Responsive SVG overlay for bounding boxes and confidence badges.
- `src/components/ImageUploadView.tsx`: Integrated AI detection trigger button and overlay.
- `src/components/WebcamView.tsx`: Integrated real-time AI detection overlay and toggle controls.
- `src/app/page.tsx`: Connected AI model lifecycle, detection state, and dynamic bin card highlighting.
- `training/prepare_dataset.py`: Automated dataset downloader and COCO-to-YOLO converter.
- `training/train.py`: Automated GPU training loop and ONNX export pipeline.
- `public/models/waste_yolov8n.onnx`: Trained custom waste detection model weights.
- `docs/PROJECT_STATUS.md`: Project status tracking documentation.

### Important Technical Decisions
1. **Handling npm Naming Restriction**: The workspace root directory name `TrashSort AI` contains spaces and capital letters, which violates npm package naming rules. The project was scaffolded with package name `trash-sort-ai` and placed at repository root.
2. **ExecutionPolicy on Windows**: Running `npm` / `npx` directly in PowerShell can trigger script execution policy blocks on `npm.ps1`. Commands should be executed using `npm.cmd` / `npx.cmd`.
3. **App Router Structure**: Placed in `src/app` for clean separation of application logic from root configurations.
4. **Git Commit Convention**: Adopted Conventional Commits with scope: `<type>(<scope>): <description>` (e.g. `chore(setup): ...`, `feat(home): ...`).
5. **Architectural Trade-off (Custom Hook vs Monolithic Component)**:
   - *Custom Hook (`useWebcam`, `useYoloModel`)*: Separates hardware lifecycle and AI runtime from presentation.
6. **Data-Driven UI**: Replaced repetitive hardcoded category cards with a typed data array and `.map()`, enabling dynamic visual highlighting when the AI model outputs waste categories.
7. **5-Stage In-Browser Vision Pipeline**:
   - `Source -> Preprocessing (640x640 NCHW) -> ONNX WebAssembly Inference -> Postprocessing (NMS) -> SVG DetectionOverlay`.
8. **Inference Concurrency & Rate Limiting**:
   - Used `isDetectingRef` concurrency guard to drop overlapping frames.
   - Webcam inference runs on a controlled 250ms interval (4 FPS) instead of raw animation frames to keep UI responsive and prevent thermal throttling.

### Commands & Tests Performed
- `node -v` -> `v24.22.0`
- `npm.cmd -v` -> `11.19.1`
- `git --version` -> `git version 2.55.0.windows.5`
- `python --version` -> `Python 3.14.8`
- `npm.cmd run build` -> Passed (Production build compiled and static pages generated successfully in 851ms).

### Known Bugs & Limitations
- Base YOLOv8n model uses COCO 80 classes (includes bottles, cups, apples, bananas, etc.). Custom fine-tuned trash-specific dataset training can be added in Phase 4.

### Next Recommended Task
- **Phase 4 — Testing, Verification & UI Polish**:
  - Test live webcam object detection with real objects (e.g. bottle, cup, phone, book).
  - Test image upload detection with waste photos.
  - Verify that the matching educational trash bin card lights up automatically when an item is detected.
