"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut } from "lucide-react";
import { getCroppedImg, type CropArea } from "@/lib/utils/cropImage";

interface ImageCropperProps {
  /** Source URL of the image to crop (blob URL or http URL) */
  imageSrc: string;
  /** Callback when crop is complete with the cropped File */
  onCropComplete: (croppedFile: File) => void;
  /** Aspect ratio for the crop (default: 1 for square) */
  aspectRatio?: number;
  /** Shape of the crop overlay: "rect" or "round" (default: "rect") */
  shape?: "rect" | "round";
  /** Initial zoom level (default: 1) */
  initialZoom?: number;
  /** Original file name for the cropped output */
  fileName?: string;
  /** Output size in pixels (default: 400) */
  outputSize?: number;
}

/**
 * Reusable image cropper component with zoom and drag controls.
 * Uses react-easy-crop for smooth cropping experience with locked aspect ratio.
 *
 * @example
 * ```tsx
 * <ImageCropper
 *   imageSrc={previewUrl}
 *   onCropComplete={(file) => setCroppedFile(file)}
 *   aspectRatio={1}
 *   shape="round"
 * />
 * ```
 */
export default function ImageCropper({
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  shape = "rect",
  initialZoom = 1,
  fileName = "cropped-image.png",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom);

  // Crop directly in the callback — avoids stale state issues
  const onCropCompleteInternal = useCallback(
    async (_croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      try {
        const croppedFile = await getCroppedImg(
          imageSrc,
          croppedAreaPixels,
          fileName,
          "image/png"
        );
        onCropComplete(croppedFile);
      } catch (error) {
        console.error("Error cropping image:", error);
      }
    },
    [imageSrc, fileName, onCropComplete]
  );

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Cropper Container - matches aspect ratio */}
      <div 
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ aspectRatio: aspectRatio }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          cropShape={shape}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteInternal}
        />
      </div>

      {/* Zoom Controls */}
      <div className="mt-4 flex items-center gap-3">
        <ZoomOut className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <Slider
          min={1}
          max={3}
          step={0.1}
          value={[zoom]}
          onValueChange={(value: number[]) => setZoom(value[0])}
          className="flex-1"
        />
        <ZoomIn className="h-4 w-4 text-slate-400 flex-shrink-0" />
      </div>

      {/* Helper Text */}
      <p className="mt-2 text-xs text-center text-slate-400">
        Drag to reposition • Scroll or use slider to zoom
      </p>
    </div>
  );
}