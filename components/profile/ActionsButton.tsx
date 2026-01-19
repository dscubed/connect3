import { Profile, useAuthStore } from "@/stores/authStore";
import { useChunkContext } from "./chunks/hooks/ChunkProvider";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";

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
  const [pendingModalOpen, setPendingModalOpen] = useState(false);

  const handleEditToggle = () => {
    // If finishing editing save chunks if no pending edits
    if (editingProfile) {
      if (hasPendingEdits()) {
        setPendingModalOpen(true);
        return;
      }
      if (savingChunks) {
        toast.error("Profile is currently being saved. Try again later.");
        return;
      }
      saveChunks();
    }
    setEditingProfile(!editingProfile);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {user?.id === profile.id && (
          <Button
            variant="outline"
            className="text-lg !bg-foreground font-medium !text-white border-[3px] border-white hover:scale-105 transition-all rounded-full py-5 shadow-none"
            onClick={handleEditToggle}
          >
            {editingProfile ? "Finish" : "Edit Profile"}
          </Button>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-secondary">
        <DialogHeader>
          <DialogTitle>Action Required</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          You have unsaved changes to your profile chunks. Please choose an
          action below to proceed.
        </p>
        <div className="mt-2 flex flex-col">
          {/* Add Links */}
          <div className="flex justify-between items-center mt-4">
            <Button
              className="w-fit h-fit animate-fade-in"
              onClick={() => {
                reset();
                exitEdit();
                onOpenChange(false);
              }}
            >
              Revert All Changes
            </Button>
            <Button
              onClick={() => {
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
