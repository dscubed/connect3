import { useState } from "react";
import { toast } from "sonner";
import { validateFile, CUBE_CONFIG } from "../utils/cubeUtils";

export const useFileHandlers = (
  files: File[],
  onFileUpload: (file: File) => void,
  onFileRemove: (index: number) => void
) => {
  const [isEating, setIsEating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileUpload = (file: File) => {
    if (files.length >= CUBE_CONFIG.MAX_FILES) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsEating(true);
    setTimeout(() => {
      onFileUpload(file);
      setIsEating(false);
    }, CUBE_CONFIG.ANIMATION_DURATION.EATING);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileUpload(selectedFiles[0]);
    }
  };

  const removeFile = (index: number) => {
    setIsDeleting(true);
    setTimeout(() => {
      onFileRemove(index);
      setIsDeleting(false);
    }, CUBE_CONFIG.ANIMATION_DURATION.DELETING);
  };

  return {
    isEating,
    isDeleting,
    handleDrop,
    handleFileSelect,
    removeFile,
  };
};
