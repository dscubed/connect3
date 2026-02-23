import { FileUp, Loader2, Undo } from "lucide-react";
import { useChunkContext } from "./hooks/ChunkProvider";
import { useProfileEditContext } from "@/components/profile/hooks/ProfileEditProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { parseDocument } from "@/lib/resume/parsers/documentParser";
import { toast } from "sonner";
import { validateFile } from "../cube/utils/cubeUtils";
import type { ResumeProfileDetails } from "@/components/profile/hooks/ProfileEditProvider";
import type { AllCategories } from "./ChunkUtils";

const RESUME_ACCEPT = ".pdf,.doc,.docx,.txt";

interface ResumeChunkResult {
  updatedChunks: { id: string; category: string; text: string }[];
  newChunks: { category: string; text: string }[];
  profileDetails?: ResumeProfileDetails | null;
}

export function ChunkActions({
  showResume = false,
}: {
  showResume?: boolean;
}) {
  const { reset, updateChunk, addChunk, resumeProcessing, setResumeProcessing } =
    useChunkContext();
  const { resetDraft, applyResumeDetails } = useProfileEditContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRevert = () => {
    reset();
    resetDraft();
  };

  const applyResumeResult = (result: ResumeChunkResult) => {
    result.updatedChunks?.forEach((chunk) => {
      updateChunk({
        id: chunk.id,
        category: chunk.category as AllCategories,
        text: chunk.text,
      });
    });
    result.newChunks?.forEach((chunk) => {
      addChunk(chunk.category as AllCategories, chunk.text);
    });
    if (result.profileDetails) {
      applyResumeDetails(result.profileDetails);
    }
  };

  const processResumeFile = async (file: File) => {
    const { makeAuthenticatedRequest, user } = useAuthStore.getState();
    if (!user) {
      toast.error("You must be logged in to upload a resume.");
      return;
    }

    const validation = validateFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setResumeProcessing(true);
    try {
      const parseResult = await parseDocument(file);
      if (!parseResult.success) {
        toast.error(parseResult.error || "Failed to parse resume.");
        setResumeProcessing(false);
        return;
      }

      const resumeText = parseResult.text || "";
      const response = await makeAuthenticatedRequest("/api/profiles/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: user.id,
          text: resumeText,
        }),
      });

      if (!response.ok) {
        const respText = await response.text().catch(() => null);
        console.error("Resume processing failed:", respText);
        toast.error("Failed to process resume. Please try again.");
        setResumeProcessing(false);
        return;
      }

      const data = await response.json();
      const result = data.result ?? data.chunks;
      if (!result) {
        toast.error("Failed to process resume. Please try again.");
        setResumeProcessing(false);
        return;
      }

      applyResumeResult(result);
      toast.success(
        "Resume applied to your profile. Use Revert to undo any changes."
      );
    } catch (err) {
      console.error("Error processing resume:", err);
      toast.error("Failed to process resume. Please try again.");
    } finally {
      setResumeProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResumeClick = () => {
    fileInputRef.current?.click();
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processResumeFile(files[0]);
    }
    e.target.value = "";
  };

  return (
    <div className="flex gap-4">
      <div className="flex gap-2 items-center">
        <h1 className="text-lg font-medium pr-2">Actions:</h1>

        <ActionButton
          icon={Undo}
          label="Revert"
          onClick={handleRevert}
        />
        {showResume && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={RESUME_ACCEPT}
              onChange={handleResumeFileChange}
              className="hidden"
              disabled={resumeProcessing}
            />
            <ActionButton
              icon={FileUp}
              label={resumeProcessing ? "Processing..." : "Resume"}
              onClick={handleResumeClick}
              disabled={resumeProcessing}
              loading={resumeProcessing}
            />
          </>
        )}
      </div>
    </div>
  );
}

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  disabled,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => {
  return (
    <Button
      type="button"
      variant={"ghost"}
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "rounded-full bg-gray-200 px-3 py-2 text-muted-foreground hover:bg-purple-200 hover:text-purple-900 transition-colors flex items-center gap-1.5",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
    >
      <span>{label}</span>
      {loading ? (
        <Loader2 className="size-4 shrink-0 animate-spin" />
      ) : (
        <Icon className="size-4 shrink-0" />
      )}
    </Button>
  );
};
