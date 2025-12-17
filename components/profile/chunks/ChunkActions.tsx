import {
  FileUp,
  MessageCircle,
  Pencil,
  PencilOff,
  RotateCcw,
  Save,
} from "lucide-react";
import { useChunkContext } from "./hooks/ChunkProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ChunkActions() {
  const {
    reset,
    saveChunks,
    fetchChunks,
    savingChunks,
    isEditing,
    setIsEditing,
  } = useChunkContext();
  return (
    <div className="flex gap-4">
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
        <ActionButton icon={FileUp} label="Resume" />
        <ActionButton icon={MessageCircle} label="Chat" />
      </div>
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
        "border-none h-fit min-w-16",
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
