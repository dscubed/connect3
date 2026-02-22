import {
  FileUp,
  MessageCircle,
  Pencil,
  PencilOff,
  RotateCcw,
  Save,
} from "lucide-react";
import { useChunkContext } from "../hooks/ChunkProvider";
import { useProfileEditContext } from "@/components/profile/hooks/ProfileEditProvider";
import { useAuthStore } from "@/stores/authStore";

export function ChunkActions({
  isEditing,
  setIsEditing,
}: {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}) {
  const { reset, saveChunks, fetchChunks } = useChunkContext();
  const { resetDraft } = useProfileEditContext();
  const profile = useAuthStore((state) => state.profile);
  const showResume = profile?.account_type === "user";

  const handleCancel = () => {
    reset();
    resetDraft();
    setIsEditing(false);
  };

  return (
    <div className="flex justify-between">
      <div className="flex gap-4">
        <div className="flex gap-8">
          {isEditing ? (
            <>
              {/* Save and Cancel for Editing */}
              <ActionButton
                icon={PencilOff}
                label="Cancel"
                onClick={handleCancel}
              />
              <ActionButton
                icon={Save}
                label="Save"
                onClick={() => {
                  saveChunks();
                  setIsEditing(false);
                }}
              />
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
        <div className="flex gap-8">
          {showResume && <ActionButton icon={FileUp} label="Resume" />}
          <ActionButton icon={MessageCircle} label="Chat" />
        </div>
      </div>
    </div>
  );
}

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex flex-col items-center border-none p-0 m-0 hover:scale-105 text-white hover:text-white/70 transition-all min-w-8"
    >
      <Icon className="h-5 w-5 cursor-pointer transition-colors" />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};
