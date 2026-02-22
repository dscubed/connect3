import { Profile, useAuthStore } from "@/stores/authStore";
import { useChunkContext } from "./chunks/hooks/ChunkProvider";
import { useProfileEditContext } from "./hooks/ProfileEditProvider";
import { Button } from "../ui/button";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
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
  const { hasPendingEdits, saveChunks, savingChunks } = useChunkContext();
  const {
    hasPendingProfileEdits,
    saveProfileEdits,
    savingProfileEdits,
  } = useProfileEditContext();
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  // Get the current link state
  const href = typeof window !== "undefined" ? window.location.href : "";
  console.log("HREF", href);

  const handleEditToggle = async () => {
    if (editingProfile) {
      if (hasPendingEdits() || hasPendingProfileEdits()) {
        setPendingModalOpen(true);
        return;
      }
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
        await saveProfileEdits();
        await saveChunks();
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

  const saving = isSaving || savingChunks || savingProfileEdits;

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
      <PendingChangesModal
        open={pendingModalOpen}
        onOpenChange={setPendingModalOpen}
      />
    </>
  );
}

const PendingChangesModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { reset, saveChunks, exitEdit, saveAllEdits } = useChunkContext();
  const { resetDraft, saveProfileEdits } = useProfileEditContext();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-secondary">
        <DialogHeader>
          <DialogTitle>Action Required</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          You have unsaved profile changes. Please choose an action below to
          proceed.
        </p>
        <div className="mt-2 flex flex-col">
          {/* Add Links */}
          <div className="flex justify-between items-center mt-4">
            <Button
              className="w-fit h-fit animate-fade-in"
              onClick={() => {
                reset();
                resetDraft();
                exitEdit();
                onOpenChange(false);
              }}
            >
              Revert All Changes
            </Button>
            <Button
              onClick={() => {
                saveProfileEdits();
                saveAllEdits();
                saveChunks();
                exitEdit();
                onOpenChange(false);
              }}
              className="animate-fade-in"
            >
              Save All Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
