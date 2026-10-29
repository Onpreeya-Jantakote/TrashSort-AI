# Project Status: TrashSort AI

## Project Overview
TrashSort AI is an educational web application designed to help users learn proper waste sorting in real-time using in-browser computer vision (Next.js + YOLO/ONNX Runtime Web).

---

## Current Phase: Phase 1 — Environment & Project Setup

### Features Completed
- [x] Environment inspection (Node.js v24.22.0, npm v11.19.1, Git v2.55.0, Python v3.14.8).
- [x] Bootstrapped Next.js application with TypeScript, Tailwind CSS v4, ESLint, and App Router.
- [x] Verified production build (`npm run build`) runs cleanly without errors.
- [x] Initialized Git repository (`git init`).
- [x] Configured `.gitignore` for AI/ML files (weights, datasets, YOLO runs, Python venv) and agent notes.
- [x] Configured TH Sarabun font (`Sarabun` via `next/font/google`) in `src/app/layout.tsx` and `src/app/globals.css`.
- [x] Built the initial TrashSort AI App Shell in `src/app/page.tsx` with responsive layout, mode switcher tab (Webcam vs Upload), clean SVG icons (no emojis), and educational waste sorting guide.

### Files Created or Changed
- `package.json`, `package-lock.json`: Dependencies configured (Next.js 16.4.3, React 19.3.0, Tailwind CSS v4, TypeScript 5).
- `tsconfig.json`: TypeScript configuration with path alias (`@/*`).
- `eslint.config.mjs`: ESLint configuration.
- `next.config.ts`: Next.js config.
- `src/app/layout.tsx`: Updated page title and metadata.
- `src/app/page.tsx`: Implemented base App Shell and interactive mode toggle.
- `docs/PROJECT_STATUS.md`: Project status tracking documentation.

### Important Technical Decisions
1. **Handling npm Naming Restriction**: The workspace root directory name `TrashSort AI` contains spaces and capital letters, which violates npm package naming rules. The project was scaffolded with package name `trash-sort-ai` and placed at repository root.
2. **ExecutionPolicy on Windows**: Running `npm` / `npx` directly in PowerShell can trigger script execution policy blocks on `npm.ps1`. Commands should be executed using `npm.cmd` / `npx.cmd`.
3. **App Router Structure**: Placed in `src/app` for clean separation of application logic from root configurations.
4. **Git Commit Convention**: Adopted Conventional Commits with scope: `<type>(<scope>): <description>` (e.g. `chore(setup): ...`, `feat(home): ...`).
5. **Client Component for UI State**: Marked `src/app/page.tsx` with `"use client"` because tab switching requires React `useState`.

### Commands & Tests Performed
- `node -v` -> `v24.22.0`
- `npm.cmd -v` -> `11.19.1`
- `git --version` -> `git version 2.55.0.windows.5`
- `python --version` -> `Python 3.14.8`
- `npm.cmd run build` -> Passed (Production build compiled and static pages generated successfully in 1.1s).

### Known Bugs & Limitations
- Visual display area currently shows placeholders. Camera stream and image upload handling will be implemented in subsequent tasks.

### Next Recommended Task
- **Phase 2 — Webcam Integration & Camera Stream Handling**: Build a dedicated modular `WebcamFeed` component to request user camera permissions (`navigator.mediaDevices.getUserMedia`), display the real-time `<video>` stream, and handle loading/denial error states gracefully.
