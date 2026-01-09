"use client";
import { useState, useRef } from "react";
import { useCubeAnimation } from "./hooks/useCubeAnimation";
import { useFileHandlers } from "./hooks/useFileHandlers";
import { CUBE_CONFIG } from "./utils/cubeUtils";
import { CubeContainer } from "./CubeContainer";
import { FileList } from "./FileList";

export const FileUploadCube = ({
  onFileUpload,
  files,
  onFileRemove,
}: {
  onFileUpload: (file: File) => void;
  files: File[];
  onFileRemove: (index: number) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { cubeRotate, cube } = useCubeAnimation(isPaused);
  const { isEating, isDeleting, handleDrop, handleFileSelect, removeFile } =
    useFileHandlers(files, onFileUpload, onFileRemove);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (files.length < CUBE_CONFIG.MAX_FILES) {
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
    onClick: () =>
      files.length < CUBE_CONFIG.MAX_FILES && fileInputRef.current?.click(),
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
      <div className="flex items-center justify-center gap-4">
        <CubeContainer
          files={files}
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
          disabled={files.length >= CUBE_CONFIG.MAX_FILES}
        />

        {files.length > 0 && <FileList files={files} onRemove={removeFile} />}
      </div>
    </div>
  );
};

export default FileUploadCube;
