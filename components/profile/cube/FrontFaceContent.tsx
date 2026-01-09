import Logo from "@/components/logo/Logo";
import { motion } from "framer-motion";

type FrontFaceContentProps = {
  files: File[];
  isEating: boolean;
};

const FrontFaceContent = ({ files, isEating }: FrontFaceContentProps) => {
  const getLogoColor = () => {
    if (files.length >= 1) return "text-zinc-200";
    return "text-black/80";
  };

  const getTextColor = () => {
    if (files.length >= 1) return "white";
    return "black";
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

      <p className={`text-${getTextColor()} text-sm mt-4`}>
        {files.length >= 1
          ? "Perfect! Resume Uploaded"
          : "Drop your resume here"}
      </p>

      <p className={`text-${getTextColor()}/60 text-xs mt-1`}>
        {files.length >= 1 ? "You're all set!" : `Let us do the rest.`}
      </p>
    </div>
  );
};

export default FrontFaceContent;
