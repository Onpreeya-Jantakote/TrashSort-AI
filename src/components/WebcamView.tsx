"use client";

import { useWebcam } from "@/hooks/useWebcam";

interface WebcamViewProps {
  onStreamingChange?: (isStreaming: boolean) => void;
}

export default function WebcamView({ onStreamingChange }: WebcamViewProps) {
  const { videoRef, isStreaming, isLoading, errorMessage, startCamera, stopCamera } = useWebcam({
    onStreamingChange,
  });

  return (
    <div className="relative aspect-video w-full rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-white shadow-sm">
      <video
        ref={videoRef}
        playsInline
        muted
        suppressHydrationWarning
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isStreaming ? "opacity-100" : "opacity-0 absolute pointer-events-none -z-10"
        }`}
      />

      {!isStreaming && !isLoading && !errorMessage && (
        <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center">
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
          <h2 className="text-base font-bold text-slate-100">กล้องเว็บแคมยังไม่ได้เปิด</h2>
          <p className="text-sm text-slate-400 max-w-sm">
            กดปุ่มด้านล่างเพื่อเปิดกล้องสำหรับการจำแนกขยะแบบเรียลไทม์
          </p>
          <button
            type="button"
            onClick={startCamera}
            className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl shadow transition cursor-pointer active:scale-95"
          >
            เปิดใช้งานกล้อง
          </button>
        </div>
      )}

      {isLoading && (
        <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
          <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-300">กำลังขอสิทธิ์และเชื่อมต่อกับกล้อง...</p>
        </div>
      )}

      {/* Error State */}
      {errorMessage && !isLoading && (
        <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
            {/* Alert Circle Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-rose-300">ไม่สามารถเข้าถึงกล้องได้</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{errorMessage}</p>
          <button
            type="button"
            onClick={startCamera}
            className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer active:scale-95"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )}

      {isStreaming && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[11px] text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE
          </div>
          <button
            type="button"
            onClick={stopCamera}
            className="px-3 py-1 rounded-full bg-rose-600/80 hover:bg-rose-600 backdrop-blur-sm text-[11px] text-white transition cursor-pointer active:scale-95"
          >
            ปิดกล้อง
          </button>
        </div>
      )}
    </div>
  );
}
