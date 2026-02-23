import { Profile, useAuthStore } from "@/stores/authStore";
import { useChunkContext } from "./chunks/hooks/ChunkProvider";
import { useProfileEditContext } from "./hooks/ProfileEditProvider";
import { Button } from "../ui/button";
import { useRef, useState } from "react";
import { toast } from "sonner";

const SAVING_MESSAGES = [
  "Polishing your profile...",
  "Making you look great...",
  "Connecting the dots...",
  "Sprinkling some magic...",
  "Almost there...",
  "Saving your awesomeness...",
  "Putting it all together...",
];

export function ActionsButton({
  profile,
  editingProfile,
  setEditingProfile,
}: {
  profile: Profile;
  editingProfile?: boolean;
  setEditingProfile: (editing: boolean) => void;
}) {
  const { user } = useAuthStore();
  const {
    saveChunks,
    saveAllEdits,
    exitEdit,
    savingChunks,
    resumeProcessing,
    hasPendingEdits,
  } = useChunkContext();
  const {
    saveProfileEdits,
    savingProfileEdits,
    hasPendingProfileEdits,
  } = useProfileEditContext();
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  const href = typeof window !== "undefined" ? window.location.href : "";

  const handleEditToggle = async () => {
    if (editingProfile) {
      if (isSavingRef.current || savingChunks || savingProfileEdits) {
        toast.error("Profile is currently being saved. Try again later.");
        return;
      }

      const hasProfileChanges = hasPendingProfileEdits();
      const hasChunkChanges = hasPendingEdits();

      if (!hasProfileChanges && !hasChunkChanges) {
        // Nothing to save, just exit edit mode
        setEditingProfile(false);
        return;
      }

      isSavingRef.current = true;
      setIsSaving(true);

      const toastId = toast.loading(
        SAVING_MESSAGES[Math.floor(Math.random() * SAVING_MESSAGES.length)],
      );
      let msgIndex = Math.floor(Math.random() * SAVING_MESSAGES.length);
      const interval = setInterval(() => {
        msgIndex = (msgIndex + 1) % SAVING_MESSAGES.length;
        toast.loading(SAVING_MESSAGES[msgIndex], { id: toastId });
      }, 2000);

      const clearLoading = () => {
        clearInterval(interval);
        isSavingRef.current = false;
        setIsSaving(false);
      };

      try {
        saveAllEdits();
        await Promise.race([
          (async () => {
            await saveProfileEdits();
            await saveChunks();
          })(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Save timed out after 120 seconds")),
              120000,
            ),
          ),
        ]);
        exitEdit();
        toast.success("Profile saved!", { id: toastId });
      } catch (err) {
        toast.error(
          err instanceof Error && err.message.includes("timed out")
            ? "Save took too long. Please try again."
            : "Failed to save profile.",
          { id: toastId },
        );
      } finally {
        clearLoading();
      }
    }
    setEditingProfile(!editingProfile);
  };

  const saving = isSaving || savingChunks || savingProfileEdits || resumeProcessing;
  const isActuallySaving = isSaving || savingChunks || savingProfileEdits;

  return (
    <>
      <div className="flex items-center gap-2">
        {!href.includes("profile") ? (
          <Button
            variant="outline"
            className="text-md !bg-foreground font-medium !text-white border-[3px] border-white hover:scale-105 transition-all rounded-full py-5 shadow-none"
            onClick={() => {
              window.open(`/profile/${profile.id}`, "_blank");
            }}
          >
            View Profile
          </Button>
        ) : (
          user?.id === profile.id && (
            <Button
              variant="outline"
              className="text-md !bg-foreground font-medium !text-white border-[3px] border-white hover:scale-105 transition-all rounded-full py-5 shadow-none"
              onClick={handleEditToggle}
              disabled={saving}
            >
              {isActuallySaving
                ? "Saving..."
                : editingProfile
                  ? "Save"
                  : "Edit Profile"}
            </Button>
          )
        )}
      </div>
    </>
  );
}
