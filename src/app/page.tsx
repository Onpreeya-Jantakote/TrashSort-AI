"use client";

import { useState } from "react";

type DetectionMode = "webcam" | "upload";

export default function Home() {
  const [activeMode, setActiveMode] = useState<DetectionMode>("webcam");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
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
            onClick={() => setActiveMode("webcam")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeMode === "webcam"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {/* Video Camera Icon */}
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
            onClick={() => setActiveMode("upload")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeMode === "upload"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {/* Image / Upload Icon */}
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

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Display Area */}
          <section className="lg:col-span-2 flex flex-col gap-4">
            <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-6 text-center shadow-sm">
              {activeMode === "webcam" ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-7 h-7"
                    >
                      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
                      <rect x="2" y="6" width="14" height="12" rx="2" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-slate-800">พื้นที่แสดงผลกล้องเว็บแคม</h2>
                  <p className="text-sm text-slate-500 max-w-sm">
                    กดปุ่มด้านล่างเพื่อเปิดกล้องเว็บแคม สำหรับตรวจจับขยะแบบเรียลไทม์
                  </p>
                  <button
                    type="button"
                    className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow transition"
                  >
                    เปิดใช้งานกล้อง
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-7 h-7"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-slate-800">อัปโหลดรูปภาพขยะ</h2>
                  <p className="text-sm text-slate-500 max-w-sm">
                    เลือกไฟล์ภาพจากคอมพิวเตอร์ของคุณ (รองรับ JPG, PNG, WEBP)
                  </p>
                  <button
                    type="button"
                    className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow transition"
                  >
                    เลือกไฟล์ภาพ
                  </button>
                </div>
              )}
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                สถานะกล้อง: <strong className="text-slate-700">ยังไม่ได้เชื่อมต่อ</strong>
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
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex gap-3 items-start">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                  <div>
                    <h3 className="text-sm font-bold text-blue-900">ขยะทั่วไป (สีน้ำเงิน)</h3>
                    <p className="text-xs text-slate-600 mt-0.5">ซองขนม, ถุงพลาสติกเปื้อน, โฟม, ทิชชู</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex gap-3 items-start">
                  <span className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">ขยะรีไซเคิล (สีเหลือง)</h3>
                    <p className="text-xs text-slate-600 mt-0.5">ขวดพลาสติก PET, กระป๋องอลูมิเนียม, กระดาษ, แก้ว</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex gap-3 items-start">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">ขยะอินทรีย์ / ขยะเปียก (สีเขียว)</h3>
                    <p className="text-xs text-slate-600 mt-0.5">เศษอาหาร, เปลือกผลไม้, เศษผัก, ใบไม้</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex gap-3 items-start">
                  <span className="w-3 h-3 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                  <div>
                    <h3 className="text-sm font-bold text-rose-900">ขยะอันตราย (สีแดง)</h3>
                    <p className="text-xs text-slate-600 mt-0.5">ถ่านไฟฉาย, หลอดไฟ, กระป๋องสเปรย์, สารเคมี</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
