import { motion } from "framer-motion";
import { Upload, FileText, Check } from "lucide-react";

type FrontFaceContentProps = {
  files: File[];
  isEating: boolean;
  contentColor: string;
};

const FrontFaceContent = ({
  files,
  isEating,
  contentColor,
}: FrontFaceContentProps) => (
  <div className="text-center">
    <motion.div
      animate={{
        rotate: files.length > 0 ? 360 : 0,
        scale: files.length > 0 ? 1.2 : isEating ? 1.5 : 1,
      }}
      transition={{ duration: isEating ? 0.6 : 0.6 }}
    >
      {files.length >= 2 ? (
        <Check className="h-12 w-12 text-green-400 mx-auto" />
      ) : files.length === 1 ? (
        <FileText className="h-12 w-12 text-blue-400 mx-auto" />
      ) : (
        <Upload className={`h-12 w-12 ${contentColor} mx-auto`} />
      )}
    </motion.div>
    <p className="text-white font-medium mt-4">
      {files.length >= 2
        ? "Perfect! 2 files uploaded"
        : files.length === 1
        ? "Great! Add one more?"
        : "Drop your files here"}
    </p>
    <p className="text-white/60 text-sm mt-1">
      {files.length >= 2
        ? "You're all set ✨"
        : `${files.length}/2 files • ${
            files.length === 0 ? "or click to browse" : "one more to go!"
          }`}
    </p>
  </div>
);

export default FrontFaceContent;
