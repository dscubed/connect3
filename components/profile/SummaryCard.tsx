import { Textarea } from "@/components/ui/TextArea";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiEnhanceDialog } from "@/components/profile/edit-modals/AiEnhanceDialog";
import { CardContent } from "@/components/ui/card";
import { SectionCard, SectionCardHeader } from "./SectionCard";
import { Profile, useAuthStore } from "@/stores/authStore";
import { PencilLine } from "lucide-react";
import { toast } from "sonner";
import { useProfileEditContext } from "./hooks/ProfileEditProvider";
import Markdown from "../ui/Markdown";

export function SummaryCard({
  editingProfile = false,
  profile,
}: {
  editingProfile?: boolean;
  profile?: Profile;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [preEditTldr, setPreEditTldr] = useState("");
  const { user } = useAuthStore();
  const { draft, setDraftFields } = useProfileEditContext();

  const displayTldr =
    editingProfile && draft ? draft.tldr : profile?.tldr || "";

  useEffect(() => {
    if (!isEditing) return;
    setPreEditTldr(displayTldr);
  }, [isEditing, displayTldr]);

  useEffect(() => {
    if (!editingProfile) {
      setIsEditing(false);
    }
  }, [editingProfile]);

  const editTldr = () => {
    if (!editingProfile) return;
    setIsEditing(true);
    setPreEditTldr(displayTldr);
  };

  const cancel = () => {
    setIsEditing(false);
    setDraftFields({ tldr: preEditTldr });
  };

  const submit = () => {
    setIsEditing(false);
    if (profile && profile.id !== user?.id) {
      toast.error("Cannot update TLDR for other users' profiles.");
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape") {
      cancel();
    }
  };

  return (
    <SectionCard className="mb-4">
      <SectionCardHeader title="Summary">
        {/* Enhance button (only when profile is in edit mode) */}

        {!editingProfile ? null : isEditing ? (
          <AiEnhanceDialog
            initialText={displayTldr}
            fieldType="external_tldr"
            title="Enhance your summary"
            onApply={(updated) => {
              // Apply the improved/generate TLDR into the editor
              setDraftFields({ tldr: updated });

              // If they weren’t already editing this field, open editing state
              if (!isEditing) setIsEditing(true);
            }}
          />
        ) : (
          <div
            className="!bg-transparent !text-muted rounded-full border border-muted/50 !p-1.5 h-fit"
            onClick={() => setIsEditing(true)}
          >
            <PencilLine className="h-4 w-4" />
          </div>
        )}
      </SectionCardHeader>

      <CardContent className="w-full flex flex-col gap-4 !p-4 !pt-0">
        {isEditing ? (
          <>
            <Textarea
              value={displayTldr}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDraftFields({ tldr: e.target.value })
              }
              className="w-full min-h-0 p-0 border-none outline-none shadow-none focus-visible:ring-0 focus:ring-0 resize-none !text-base !leading-relaxed placeholder:text-muted"
              placeholder="Add a short summary of yourself to allow others to get to know you better and make your profile more discoverable."
              onKeyDown={handleKeyDown}
            />
            <div className="w-full flex flex-row justify-end gap-2 animate-fade-in">
              <Button
                variant="ghost"
                onClick={submit}
                className="rounded-full bg-purple-500 px-4 py-1.5 text-white hover:bg-purple-600 hover:text-white"
              >
                Save
              </Button>
              <Button
                variant="ghost"
                onClick={cancel}
                className="rounded-full bg-gray-200 px-4 py-1.5 text-muted hover:bg-gray-300 hover:text-card-foreground"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : displayTldr.length > 0 ? (
          <div className="leading-relaxed text-base" onClick={editTldr}>
            <Markdown rawText={displayTldr} />
          </div>
        ) : (
          <span
            className="flex leading-relaxed text-base text-muted"
            onClick={editTldr}
          >
            Add a short summary of yourself to allow others to get to know you
            better and make your profile more discoverable.
          </span>
        )}
      </CardContent>
    </SectionCard>
  );
}
