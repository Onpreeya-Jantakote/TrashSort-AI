"use client";

import { useState } from "react";
import WebcamView from "@/components/WebcamView";
import ImageUploadView from "@/components/ImageUploadView";
import type { WasteCategoryType } from "@/types/detection";

type DetectionMode = "webcam" | "upload";

interface WasteCategory {
  id: WasteCategoryType;
  name: string;
  binColorName: string;
  dotColor: string;
  bgLight: string;
  borderColor: string;
  titleColor: string;
  description: string;
}

// Waste categories data for educational guide cards
const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: "general",
    name: "ขยะทั่วไป",
    binColorName: "สีน้ำเงิน",
    dotColor: "bg-blue-500",
    bgLight: "bg-blue-50/60",
    borderColor: "border-blue-100",
    titleColor: "text-blue-900",
    description: "ซองขนม, ถุงพลาสติกเปื้อน, โฟม, ทิชชู",
  },
  {
    id: "recycle",
    name: "ขยะรีไซเคิล",
    binColorName: "สีเหลือง",
    dotColor: "bg-amber-500",
    bgLight: "bg-amber-50/60",
    borderColor: "border-amber-100",
    titleColor: "text-amber-900",
    description: "ขวดพลาสติก PET, กระป๋องอลูมิเนียม, กระดาษ, แก้ว",
  },
  {
    id: "organic",
    name: "ขยะอินทรีย์ / ขยะเปียก",
    binColorName: "สีเขียว",
    dotColor: "bg-emerald-500",
    bgLight: "bg-emerald-50/60",
    borderColor: "border-emerald-100",
    titleColor: "text-emerald-900",
    description: "เศษอาหาร, เปลือกผลไม้, เศษผัก, ใบไม้",
  },
  {
    id: "hazardous",
    name: "ขยะอันตราย",
    binColorName: "สีแดง",
    dotColor: "bg-rose-500",
    bgLight: "bg-rose-50/60",
    borderColor: "border-rose-100",
    titleColor: "text-rose-900",
    description: "ถ่านไฟฉาย, หลอดไฟ, กระป๋องสเปรย์, สารเคมี",
  },
];

export default function Home() {
  const [activeMode, setActiveMode] = useState<DetectionMode>("webcam");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Switch between webcam and upload tabs
  const handleModeChange = (mode: DetectionMode) => {
    setActiveMode(mode);
    if (mode !== "webcam") {
      setIsCameraActive(false);
    }
  };

  // Handle selected image file (save name or clear it)
  const handleImageChange = (file: File | null) => {
    if (file !== null) {
      // File selected -> save file name
      setUploadedFileName(file.name);
    } else {
      // No file (user cleared image) -> reset to null
      setUploadedFileName(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* App Logo */}
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl select-none">
              ♻️
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-700 tracking-tight">TrashSort AI</h1>
              <p className="text-xs text-slate-500">ระบบจำแนกและแนะนำการแยกขยะอัจฉริยะ</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl w-full sm:w-fit self-center">
          <button
            type="button"
            onClick={() => handleModeChange("webcam")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeMode === "webcam"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
              <rect x="2" y="6" width="14" height="12" rx="2" />
            </svg>
            ตรวจจับผ่านกล้อง (Webcam)
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("upload")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeMode === "upload"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            อัปโหลดรูปภาพ (Upload)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 flex flex-col gap-4">
            {activeMode === "webcam" ? (
              <WebcamView onStreamingChange={setIsCameraActive} />
            ) : (
              <ImageUploadView onImageChange={handleImageChange} />
            )}

            {/* Status Footer */}
            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeMode === "webcam"
                      ? isCameraActive
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-slate-300"
                      : uploadedFileName
                      ? "bg-blue-500"
                      : "bg-slate-300"
                  }`}
                ></span>
                {activeMode === "webcam" ? (
                  <>
                    สถานะกล้อง:{" "}
                    <strong className={isCameraActive ? "text-emerald-700" : "text-slate-700"}>
                      {isCameraActive ? "กำลังถ่ายทอดสด (Live)" : "ยังไม่ได้เชื่อมต่อ"}
                    </strong>
                  </>
                ) : (
                  <>
                    โหมดอัปโหลด:{" "}
                    <strong className={uploadedFileName ? "text-blue-700 truncate max-w-[200px]" : "text-slate-700"}>
                      {uploadedFileName ? `เลือกรูปภาพแล้ว (${uploadedFileName})` : "รอเลือกรูปภาพ..."}
                    </strong>
                  </>
                )}
              </span>
              <span>ประมวลผลบนเบราว์เซอร์ (Client-side)</span>
            </div>
          </section>

          {/* Educational Sidebar */}
          <aside className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-emerald-600"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
                <h2 className="text-base font-bold text-slate-800">คู่มือประเภทถังขยะ</h2>
              </div>

              <div className="flex flex-col gap-3">
                {WASTE_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className={`p-3 rounded-xl border flex gap-3 items-start transition-all ${category.bgLight} ${category.borderColor}`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${category.dotColor}`}
                    ></span>
                    <div>
                      <h3 className={`text-sm font-bold ${category.titleColor}`}>
                        {category.name} ({category.binColorName})
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
