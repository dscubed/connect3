import { useState } from "react";
import { toast } from "sonner";
import { validateFile, CUBE_CONFIG } from "../utils/cubeUtils";

export const useFileHandlers = (
  file: File | null,
  onFileChange: (file: File | null) => void
) => {
  const [isEating, setIsEating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileUpload = (newFile: File) => {
    console.log("Existing File?", file);
    if (file) return; // Already has a file
    console.log("Uploading file:", newFile);

    const validation = validateFile(newFile);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsEating(true);
    setTimeout(() => {
      onFileChange(newFile);
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
    console.log("File input changed:", e.target.files);
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileUpload(selectedFiles[0]);
    }
    // Reset input value so the same file can be selected again
    e.target.value = "";
  };

  const removeFile = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onFileChange(null);
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
