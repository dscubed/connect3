import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { useState } from "react";
import { ResumeUploadContent } from "./ResumeUploadContent";
import { UserCategories } from "../ChunkUtils";
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setResume(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogOverlay />
      <DialogContent className="bg-transparent border-none shadow-none overflow-hidden">
        <ResumeUploadContent
          file={resume}
          setFile={setResume}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
