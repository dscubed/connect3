import { Profile, useAuthStore } from "@/stores/authStore";
import { useChunkContext } from "./chunks/hooks/ChunkProvider";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

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
  const { hasPendingEdits } = useChunkContext();
  const [pendingModalOpen, setPendingModalOpen] = useState(false);

  const handleEditToggle = () => {
    // If finishing editing, reset chunk edits and exit chunk editing mode
    if (editingProfile && hasPendingEdits()) {
      setPendingModalOpen(true);
      return;
    }
    setEditingProfile(!editingProfile);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {user?.id === profile.id && (
          <Button
            variant="outline"
            className="text-lg bg-secondary-foreground font-medium text-secondary hover:scale-105 hover:bg-secondary-foreground hover:text-secondary transition-all rounded-2xl"
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
