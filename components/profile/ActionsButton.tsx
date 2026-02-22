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
  } = useChunkContext();
  const { saveProfileEdits, savingProfileEdits } = useProfileEditContext();
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  // Get the current link state
  const href = typeof window !== "undefined" ? window.location.href : "";
  console.log("HREF", href);

  const handleEditToggle = async () => {
    if (editingProfile) {
      if (isSavingRef.current || savingChunks || savingProfileEdits) {
        toast.error("Profile is currently being saved. Try again later.");
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

      try {
        saveAllEdits();
        await saveProfileEdits();
        await saveChunks();
        exitEdit();
        toast.success("Profile saved!", { id: toastId });
      } catch {
        toast.error("Failed to save profile.", { id: toastId });
      } finally {
        clearInterval(interval);
        isSavingRef.current = false;
        setIsSaving(false);
      }
    }
    setEditingProfile(!editingProfile);
  };

  const saving = isSaving || savingChunks || savingProfileEdits || resumeProcessing;

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
              {saving ? "Saving..." : editingProfile ? "Save" : "Edit Profile"}
            </Button>
          )
        )}
      </div>
    </>
  );
}
