import { FileUp, Undo } from "lucide-react";
import { useChunkContext } from "./hooks/ChunkProvider";
import { useProfileEditContext } from "@/components/profile/hooks/ProfileEditProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ResumeUploadModal } from "./resume/ChunkResumeModal";
import { useAuthStore } from "@/stores/authStore";

export function ChunkActions({
  showResume = false,
}: {
  showResume?: boolean;
}) {
  const { reset } = useChunkContext();
  const { resetDraft } = useProfileEditContext();
  const [resumeOpen, setResumeOpen] = useState(false);
  const profile = useAuthStore((state) => state.profile);
  const showResume = profile?.account_type === "user";

  const handleRevert = () => {
    reset();
    resetDraft();
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
          <ActionButton
            icon={FileUp}
            label="Resume"
            onClick={() => setResumeOpen(true)}
          />
        )}
      </div>

      {/* Resume Upload Modal */}
      {showResume && (
        <ResumeUploadModal
          isOpen={resumeOpen}
          onClose={() => setResumeOpen(false)}
        />
      )}
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
        "rounded-full bg-gray-200 px-3 py-2 text-muted-foreground hover:bg-purple-200 hover:text-purple-900 transition-colors flex items-center gap-1.5",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
    >
      <span>{label}</span>
      <Icon className="size-4 shrink-0" />
    </Button>
  );
};
