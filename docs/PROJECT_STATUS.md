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
- [x] Configured `.gitignore` for AI/ML files (weights, datasets, YOLO runs, Python venv).

### Files Created or Changed
- `package.json`, `package-lock.json`: Dependencies configured (Next.js 16.4.3, React 19.3.0, Tailwind CSS v4, TypeScript 5).
- `tsconfig.json`: TypeScript configuration with path alias (`@/*`).
- `eslint.config.mjs`: ESLint configuration.
- `next.config.ts`: Next.js config.
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`: Base Next.js App Router scaffold.
- `docs/PROJECT_STATUS.md`: Project status tracking documentation.

### Important Technical Decisions
1. **Handling npm Naming Restriction**: The workspace root directory name `TrashSort AI` contains spaces and capital letters, which violates npm package naming rules. The project was scaffolded with package name `trash-sort-ai` and placed at repository root.
2. **ExecutionPolicy on Windows**: Running `npm` / `npx` directly in PowerShell can trigger script execution policy blocks on `npm.ps1`. Commands should be executed using `npm.cmd` / `npx.cmd`.
3. **App Router Structure**: Placed in `src/app` for clean separation of application logic from root configurations.
4. **Git Commit Convention**: Adopted Conventional Commits with scope: `<type>(<scope>): <description>` (e.g. `chore(setup): ...`, `feat(home): ...`).

### Commands & Tests Performed
- `node -v` -> `v24.22.0`
- `npm.cmd -v` -> `11.19.1`
- `git --version` -> `git version 2.55.0.windows.5`
- `python --version` -> `Python 3.14.8`
- `npm.cmd run build` -> Passed (Production build compiled and static pages generated successfully).

### Known Bugs & Limitations
- None at this stage. Default Next.js starter page is in place.

### Next Recommended Task
- **Phase 1 (Continued) — Clean Starter Page & Basic App Shell**: Clean up default Next.js template boilerplate in [`src/app/page.tsx`](file:///c:/repo/TrashSort%20AI/src/app/page.tsx), set up the TrashSort AI header/layout, and make our initial git commit (`chore: initialize Next.js project with TypeScript and Tailwind CSS`).
