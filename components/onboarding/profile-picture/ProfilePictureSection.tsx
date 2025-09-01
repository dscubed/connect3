import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, User, X } from "lucide-react";

interface ProfilePictureSectionProps {
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  imageUrl: string | null;
}

export default function ProfilePictureSection({
  onImageUpload,
  onImageRemove,
  imageUrl,
}: ProfilePictureSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageUpload(files[0]);
    }
  };

  const handleClick = () => {
    if (imageUrl) {
      // If image exists, reset/remove it
      onImageRemove?.();
    } else {
      // If no image, open file picker
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        className="relative mx-auto w-48 h-48"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="relative w-full h-full cursor-pointer"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20 bg-white/5 backdrop-blur-md">
            {imageUrl ? (
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <motion.div
                  animate={{ rotate: isHovered ? 360 : 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <User className="h-16 w-16 text-white/40" />
                </motion.div>
                <p className="text-white/60 text-sm text-center px-4">
                  Add your photo
                </p>
              </div>
            )}
          </div>

          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{
              scale: isHovered ? 1.1 : 1,
              opacity: isHovered ? 0.8 : 0.3,
            }}
            transition={{ duration: 0.3 }}
          />

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm"
              >
                {imageUrl ? (
                  <X className="h-8 w-8 text-white" />
                ) : (
                  <Upload className="h-8 w-8 text-white" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </motion.div>

      <div className="text-center space-y-2">
        <p className="text-white/80">
          {imageUrl ? "Click to remove your photo" : "Add a photo so people can recognize you"}
        </p>
        <p className="text-white/50 text-sm max-w-md mx-auto">
          {imageUrl 
            ? "You can always change or remove your photo later."
            : "Upload a clear photo of yourself. This helps others connect with you more easily."
          }
        </p>
      </div>
    </div>
  );
}
