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

export function ChunkActions({
  isEditing,
  setIsEditing,
}: {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}) {
  const { reset, saveChunks, fetchChunks, savingChunks } = useChunkContext();
  return (
    <div className="flex gap-4">
      <div className="flex gap-8">
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
      <div className="border-l border-white/20 h-full py-4 self-center" />
      {/* Resume Upload and AI Chat */}
      <div className="flex gap-8">
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
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center border-none p-0 m-0 transition-all min-w-8",
        disabled
          ? "text-white/30 cursor-not-allowed"
          : "hover:scale-105 text-white hover:text-white/70 cursor-pointer"
      )}
    >
      <Icon className="h-5 w-5 cursor-pointer transition-colors" />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};
