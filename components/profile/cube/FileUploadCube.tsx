"use client";
import { useState, useRef } from "react";
import { useCubeAnimation } from "./hooks/useCubeAnimation";
import { useFileHandlers } from "./hooks/useFileHandlers";
import { CubeContainer } from "./CubeContainer";
import { FileList } from "./FileList";

export const FileUploadCube = ({
  file,
  onFileChange,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { cubeRotate, cube } = useCubeAnimation(isPaused);
  const { isEating, isDeleting, handleDrop, handleFileSelect, removeFile } =
    useFileHandlers(file, onFileChange);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!file) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleCubeInteraction = {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: (e: React.DragEvent) => {
      setIsDragging(false);
      handleDrop(e);
    },
    onClick: () => !file && fileInputRef.current?.click(),
    onMouseEnter: () => {
      setIsHovered(true);
      setIsPaused(true);
    },
    onMouseLeave: () => {
      setIsHovered(false);
      setIsPaused(false);
    },
    onTouchStart: () => {
      setIsHovered(true);
      setIsPaused(true);
    },
    onTouchEnd: () => {
      setIsHovered(false);
      setIsPaused(false);
    },
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center gap-4">
        <CubeContainer
          file={file}
          isDragging={isDragging}
          isHovered={isHovered}
          isEating={isEating}
          isDeleting={isDeleting}
          cubeRotate={cubeRotate}
          cube={cube}
          {...handleCubeInteraction}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
          disabled={!!file}
        />

        {file && <FileList file={file} onRemove={removeFile} />}
      </div>
    </div>
  );
};

export default FileUploadCube;
