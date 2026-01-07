import { Profile, useAuthStore } from "@/stores/authStore";
import { useChunkContext } from "./chunks/hooks/ChunkProvider";
import { Button } from "../ui/button";

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
  const { setIsEditing, reset } = useChunkContext();

  const handleEditToggle = () => {
    setEditingProfile(!editingProfile);
    // If finishing editing, reset chunk edits and exit chunk editing mode
    if (editingProfile) {
      setIsEditing(false);
      reset();
    }
  };

  return (
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
  );
}
