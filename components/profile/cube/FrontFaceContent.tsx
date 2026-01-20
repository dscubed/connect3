import Logo from "@/components/logo/Logo";
import { motion } from "framer-motion";

type FrontFaceContentProps = {
  hasFile: boolean;
  isEating: boolean;
};

const FrontFaceContent = ({ hasFile, isEating }: FrontFaceContentProps) => {
  const getLogoColor = () => {
    if (hasFile) return "text-zinc-200";
    return "text-black/80";
  };

  const getTextColor = () => {
    if (hasFile) return "white";
    return "black";
  };

  return (
    <div className="text-center">
      <motion.div
        animate={{
          rotate: hasFile ? 360 : 0,
          scale: hasFile ? 1.2 : isEating ? 1.5 : 1,
        }}
        transition={{ duration: 0.6 }}
      >
        <Logo className={`h-16 w-16 ${getLogoColor()} mx-auto`} />
      </motion.div>

      <p className={`text-${getTextColor()} text-sm mt-4`}>
        {hasFile ? "Perfect! Resume Uploaded" : "Drop your resume here"}
      </p>

      <p className={`text-${getTextColor()}/60 text-xs mt-1`}>
        {hasFile ? "You're all set!" : `Let us do the rest.`}
      </p>
    </div>
  );
};

export default FrontFaceContent;
