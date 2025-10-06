import Logo from "@/components/Logo";
import { motion } from "framer-motion";

type FrontFaceContentProps = {
  files: File[];
  isEating: boolean;
  contentColor: string;
};

const FrontFaceContent = ({
  files,
  isEating,
  contentColor,
}: FrontFaceContentProps) => {
  const getLogoColor = () => {
    if (files.length >= 2) return "text-green-400";
    if (files.length === 1) return "text-blue-400";
    return contentColor;
  };

  return (
    <div className="text-center">
      <motion.div
        animate={{
          rotate: files.length > 0 ? 360 : 0,
          scale: files.length > 0 ? 1.2 : isEating ? 1.5 : 1,
        }}
        transition={{ duration: 0.6 }}
      >
        <Logo className={`h-16 w-16 ${getLogoColor()} mx-auto`} />
      </motion.div>

      <p className="text-white font-medium mt-4">
        {files.length >= 2
          ? "Perfect! 2 files uploaded"
          : "Drop your files here"}
      </p>

      <p className="text-white/60 text-sm mt-1">
        {files.length >= 2
          ? "You're all set!"
          : `${files.length}/2 files • ${
              files.length === 0 ? "or click to browse" : "one more to go!"
            }`}
      </p>
    </div>
  );
};

export default FrontFaceContent;
