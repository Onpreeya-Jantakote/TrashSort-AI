"use client";

import { useEffect, useRef, useState } from "react";

interface ImageUploadViewProps {
  imageRef?: React.RefObject<HTMLImageElement | null>;
  onImageChange?: (file: File | null, imageUrl: string | null) => void;
}

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploadView({
  imageRef: externalImageRef,
  onImageChange,
}: ImageUploadViewProps) {
  const internalImageRef = useRef<HTMLImageElement | null>(null);
  const imageRef = externalImageRef || internalImageRef;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);

    // 1. Check file type (JPEG, PNG, or WEBP only)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage("กรุณาเลือกไฟล์รูปภาพที่เป็น JPG, PNG หรือ WEBP เท่านั้น");
      return;
    }

    // 2. Check file size (max 10MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setErrorMessage(`ไฟล์รูปภาพมีขนาดใหญ่เกินไป (${fileSizeMB.toFixed(1)} MB) กรุณาใช้ไฟล์ไม่เกิน ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    // 3. Free old image URL from memory to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // 4. Create in-memory object URL to show image preview immediately
    const newUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(newUrl);
    onImageChange?.(file, newUrl);
  };

  // Handle file select from file picker dialog
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so user can pick the same file again if needed
    e.target.value = "";
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Clear selected image
  const handleClearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    onImageChange?.(null, null);
  };

  // Clean up object URL when component unmounts (e.g. switching back to webcam)
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="relative aspect-video w-full rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-white shadow-sm">
      {/* Hidden browser file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Preview Mode */}
      {previewUrl ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black/90">
          {/* Image element ready for AI module */}
          <img
            ref={imageRef}
            src={previewUrl}
            alt={selectedFile?.name || "Uploaded Waste"}
            className="max-w-full max-h-full object-contain"
          />

          {/* Top toolbar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            {/* File name and file size */}
            <div className="pointer-events-auto max-w-[60%] px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs text-slate-200 truncate flex items-center gap-2">
              <span className="truncate">{selectedFile?.name}</span>
              <span className="text-slate-400 shrink-0 text-[11px]">
                ({((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>

            {/* Change and delete buttons */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-xs font-semibold text-white transition active:scale-95"
              >
                เปลี่ยนรูปภาพ
              </button>
              <button
                type="button"
                onClick={handleClearImage}
                className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 backdrop-blur-md text-xs font-semibold text-white transition active:scale-95"
              >
                ลบรูป
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "bg-blue-950/40 border-2 border-dashed border-blue-400 scale-[0.99]"
              : "border-2 border-dashed border-slate-700 hover:border-slate-500 bg-slate-900/80"
          }`}
        >
          {/* pointer-events-none prevents child elements from triggering dragleave flickering */}
          <div className="pointer-events-none flex flex-col items-center">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isDragging ? "bg-blue-500/20 text-blue-300" : "bg-slate-800 text-blue-400"
              }`}
            >
              {/* Upload Icon */}
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </div>

            <h2 className="text-base font-bold text-slate-100 mt-3">
              {isDragging ? "ปล่อยรูปภาพที่นี่เพื่ออัปโหลด" : "ลากรูปภาพมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              รองรับไฟล์รูปภาพ JPG, PNG, WEBP (ขนาดไม่เกิน {MAX_FILE_SIZE_MB} MB)
            </p>

            <span className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl shadow transition inline-block">
              เลือกไฟล์รูปภาพ
            </span>
          </div>

          {errorMessage && (
            <div className="mt-3 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs pointer-events-none">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
