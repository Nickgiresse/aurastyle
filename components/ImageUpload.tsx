"use client";

import { useState, useRef, useEffect, DragEvent } from "react";

interface Props {
  value?: string;
  onChange: (file: File) => void;
  label?: string;
  aspectRatio?: "product" | "category" | "square";
}

const aspectClasses = {
  product: "aspect-[4/5]",
  category: "aspect-[3/2]",
  square: "aspect-square",
};

export default function ImageUpload({
  value,
  onChange,
  label = "Image",
  aspectRatio = "product",
}: Props) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFile = (file: File) => {
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont acceptées (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image trop lourde (max 10MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
          ${aspectClasses[aspectRatio]}
          ${
            isDragging
              ? "scale-[1.02] border-[#00BCD4] bg-[#00BCD4]/5"
              : preview
                ? "border-gray-200 hover:border-[#00BCD4]"
                : "border-gray-300 hover:border-[#00BCD4] hover:bg-gray-50"
          }
        `}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Prévisualisation"
              className="h-full w-full rounded-xl object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <span className="text-3xl text-white">📷</span>
              <span className="text-sm font-medium text-white">
                Changer l&apos;image
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <span className="text-2xl">🖼️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Glisser-déposer ou{" "}
                <span className="text-[#00BCD4]">parcourir</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP • Max 10MB</p>
            </div>
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#00BCD4]/10">
                <p className="text-lg font-semibold text-[#00BCD4]">
                  Déposer ici !
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
          <span>⚠️</span> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
