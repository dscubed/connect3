export const CUBE_CONFIG = {
  SIZE: 192, // w-48 h-48 = 192px
  HALF: 96, // cubeSize / 2 for positioning faces
  MAX_FILES: 1,
  ALLOWED_TYPES: ["pdf", "doc", "docx", "txt"],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ANIMATION_DURATION: {
    EATING: 600,
    DELETING: 400,
    TRANSITION: 600,
  },
};

export const getFaceBg = (filesLength: number): string => {
  if (filesLength === 0)
    return "bg-background/40 border-foreground/50 border-2";
  return "bg-green-400/10 border-green-600/40";
};

export const getCubeScale = (
  isDragging: boolean,
  isHovered: boolean,
  isEating: boolean,
  isDeleting: boolean
): number => {
  if (isDragging) return 1.1;
  if (isHovered) return 1.05;
  if (isEating) return 0.9;
  if (isDeleting) return 0.85;
  return 1;
};

export const validateFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (!ext || !CUBE_CONFIG.ALLOWED_TYPES.includes(ext)) {
    return {
      isValid: false,
      error: "Invalid file type. Only PDF, DOC, DOCX, TXT allowed.",
    };
  }

  if (file.size > CUBE_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "File too large. Max 10MB allowed.",
    };
  }

  return { isValid: true };
};
