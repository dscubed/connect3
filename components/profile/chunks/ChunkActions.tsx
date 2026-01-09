"use client";

import {
  FileUp,
  MessageCircle,
  Pencil,
  PencilOff,
  RotateCcw,
  Save,
} from "lucide-react";
import { parseDocument } from "@/lib/onboarding/parsers/documentParser";
import { useChunkContext } from "./hooks/ChunkProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import FileUploadCube from "@/components/profile/cube/FileUploadCube";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

export function ChunkActions() {
  const [resumeOpen, setResumeOpen] = useState(false);

  const {
    reset,
    saveChunks,
    fetchChunks,
    savingChunks,
    isEditing,
    setIsEditing,
  } = useChunkContext();
  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="flex gap-2">
        {isEditing ? (
          <>
            {/* Save and Cancel for Editing */}
            <ActionButton
              icon={PencilOff}
              label="Cancel"
              onClick={() => {
                reset();
                setIsEditing(false);
              }}
            />
            {savingChunks ? (
              <ActionButton icon={Save} label="Saving..." disabled={true} />
            ) : (
              <ActionButton
                icon={Save}
                label="Save"
                onClick={() => {
                  saveChunks();
                  setIsEditing(false);
                }}
              />
            )}
          </>
        ) : (
          <>
            {/* Edit and Refresh for Viewing */}
            <ActionButton
              icon={Pencil}
              label="Edit"
              onClick={() => setIsEditing(true)}
            />
            <ActionButton
              icon={RotateCcw}
              label="Refresh"
              onClick={() => fetchChunks()}
            />
          </>
        )}
      </div>
      {/* Separator */}
      <div className="border-l-2 border-secondary-foreground/20 h-full py-4 self-center" />
      {/* Resume Upload and AI Chat */}
      <div className="flex gap-2">
        <ActionButton
          icon={FileUp}
          label="Resume"
          onClick={() => setResumeOpen(true)}
        />
        <ActionButton icon={MessageCircle} label="Chat" />
      </div>

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={resumeOpen}
        onClose={() => setResumeOpen(false)}
      />
    </div>
  );
}

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button
      type="button"
      variant={"ghost"}
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "border-none h-fit min-w-16 px-2 py-1",
        disabled ? "cursor-not-allowed" : "hover:scale-105 cursor-pointer"
      )}
    >
      <div className="flex flex-col items-center transition-all">
        <Icon className="h-5 w-5 cursor-pointer transition-colors" />
        <span className="text-xs mt-1">{label}</span>
      </div>
    </Button>
  );
};

const ResumeUploadModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [resume, setResume] = useState<File[]>([]);
  const { makeAuthenticatedRequest, user } = useAuthStore.getState();
  const handleProcessResume = async () => {
    if (resume.length === 0) {
      toast.error("Please upload a resume before processing.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to upload a resume.");
      return;
    }

    // Parse the file on the client and send text to the server
    try {
      const parseResult = await parseDocument(resume[0]);
      if (!parseResult.success) {
        toast.error(parseResult.error || "Failed to parse resume.");
        return;
      }

      const resumeText = parseResult.text || "";

      const response = await makeAuthenticatedRequest("/api/profiles/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: user.id, fileName: resume[0].name, text: resumeText }),
      });

      if (!response.ok) {
        const respText = await response.text().catch(() => null);
        console.error("Resume processing failed:", respText);
        toast.error("Failed to process resume. Please try again.");
        return;
      }

      toast.success(
        `Resume ${resume.map((r) => r.name).join(", ")} processed successfully!`
      );
    } catch (err) {
      console.error("Error processing resume:", err);
      toast.error("Failed to process resume. Please try again.");
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay />
      <DialogContent className="bg-transparent border-none shadow-none">
        <DialogTitle className="text-2xl font-semibold text-center text-white drop-shadow-md">
          Upload Your Resume
        </DialogTitle>
        <DialogDescription className="text-center mb-16 text-white/80 drop-shadow-md">
          Upload your resume to auto fill your profile information.
        </DialogDescription>

        <FileUploadCube
          files={resume}
          onFileUpload={(file: File) => setResume((prev) => [...prev, file])}
          onFileRemove={(index: number) =>
            setResume((prev) => prev.filter((_, i) => i !== index))
          }
        />

        <div className="flex flex-row w-full justify-center gap-6 mt-12">
          <Button
            variant="default"
            className="block shadow-lg hover:bg-background/80"
            onClick={onClose}
          >
            Cancel Upload
          </Button>
          <Button
            variant="default"
            className="block shadow-lg text-background bg-foreground hover:bg-foreground/80"
            onClick={handleProcessResume}
            disabled={resume.length === 0}
          >
            Process Resume
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
