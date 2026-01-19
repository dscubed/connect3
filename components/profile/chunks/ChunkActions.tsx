import { FileUp, Undo } from "lucide-react";
import { useChunkContext } from "./hooks/ChunkProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ResumeUploadModal } from "./resume/ChunkResumeModal";

export function ChunkActions() {
  const { reset } = useChunkContext();
  const [resumeOpen, setResumeOpen] = useState(false);

  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="flex gap-2 items-center">
        <h1 className="text-lg font-medium pr-4">Actions:</h1>

        {/* Save and Cancel for Editing */}
        <ActionButton
          icon={Undo}
          label="Revert"
          onClick={() => {
            reset();
          }}
        />
        <ActionButton
          icon={FileUp}
          label="Resume"
          onClick={() => setResumeOpen(true)}
        />
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
