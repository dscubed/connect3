import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { useState } from "react";
import { ResumeUploadContent } from "./ResumeUploadContent";
import { UserCategories } from "../ChunkUtils";
import { ResumeResultContent } from "./ResumeResultContent";
import { AnimatePresence, motion } from "framer-motion";
import { ResumeProfileDetails } from "@/components/profile/hooks/ProfileEditProvider";

export interface ResumeChunkResult {
  updatedChunks: {
    id: string;
    category: UserCategories;
    text: string;
  }[];
  newChunks: {
    category: UserCategories;
    text: string;
  }[];
  profileDetails?: ResumeProfileDetails | null;
}

export const ResumeUploadModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [resume, setResume] = useState<File | null>(null);

  const [result, setResult] = useState<ResumeChunkResult | null>(null);

  const reset = () => {
    setResult(null);
    setResume(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent className="bg-transparent border-none shadow-none overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!result ? (
            <motion.div
              key="upload"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ResumeUploadContent
                file={resume}
                setFile={setResume}
                onClose={onClose}
                setResult={setResult}
              />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ResumeResultContent result={result} onClose={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
