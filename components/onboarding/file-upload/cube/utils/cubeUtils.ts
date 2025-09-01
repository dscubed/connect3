export const CUBE_CONFIG = {
  SIZE: 192, // w-48 h-48 = 192px
  HALF: 96, // cubeSize / 2 for positioning faces
  MAX_FILES: 2,
  ALLOWED_TYPES: ["pdf", "doc", "docx", "txt"],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ANIMATION_DURATION: {
    EATING: 600,
    DELETING: 400,
    TRANSITION: 600,
  }
};

export const getContentColor = (filesLength: number): string => {
  if (filesLength === 0) return "text-white/60";
  if (filesLength === 1) return "text-blue-400";
  return "text-green-400";
};

export const getFaceBorder = (filesLength: number, face: string): string => {
  const borders = {
    0: {
      front: "border-white/30",
      back: "border-white/20",
      right: "border-white/15",
      left: "border-white/10",
      top: "border-white/15",
      bottom: "border-white/10",
    },
    1: {
      front: "border-blue-400/60",
      back: "border-blue-400/30",
      right: "border-blue-400/25",
      left: "border-blue-400/20",
      top: "border-blue-400/25",
      bottom: "border-blue-400/20",
    },
    2: {
      front: "border-green-400/60",
      back: "border-green-400/30",
      right: "border-green-400/25",
      left: "border-green-400/20",
      top: "border-green-400/25",
      bottom: "border-green-400/20",
    }
  };

  const key = Math.min(filesLength, 2) as 0 | 1 | 2;
  return borders[key][face as keyof typeof borders[0]] || borders[key].front;
};

export const getFaceBg = (filesLength: number): string => {
  if (filesLength === 0) return "bg-white/5";
  if (filesLength === 1) return "bg-blue-400/10";
  return "bg-green-400/10";
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

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  
  if (!ext || !CUBE_CONFIG.ALLOWED_TYPES.includes(ext)) {
    return {
      isValid: false,
      error: "Invalid file type. Only PDF, DOC, DOCX, TXT allowed."
    };
  }
  
  if (file.size > CUBE_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "File too large. Max 10MB allowed."
    };
  }
  
  return { isValid: true };
};
