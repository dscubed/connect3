import { Textarea } from "@/components/ui/TextArea";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiEnhanceDialog } from "@/components/profile/edit-modals/AiEnhanceDialog";
import { CardContent } from "@/components/ui/card";
import { SectionCard, SectionCardHeader } from "./SectionCard";
import { Profile, useAuthStore } from "@/stores/authStore";
import { PencilLine } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useProfileEditContext } from "./hooks/ProfileEditProvider";

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
            title="Enhance your TLDR"
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
              className="w-full focus-visible:ring-0 resize-none min-h-0 border-none !text-base py-0 !leading-relaxed placeholder:text-muted"
              placeholder="Add a short summary of yourself to allow others to get to know you better and make your profile more discoverable."
              onKeyDown={handleKeyDown}
            />
            <div className="w-full flex flex-row justify-end gap-2 animate-fade-in">
              <Button
                variant="ghost"
                onClick={cancel}
                className="text-card-foreground hover:bg-transparent hover:text-muted"
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                onClick={submit}
                className="text-card-foreground hover:bg-transparent hover:text-muted"
              >
                Save
              </Button>
            </div>
          </>
        ) : displayTldr.length > 0 ? (
          <div className="loading-relaxed text-base" onClick={editTldr}>
            <ReactMarkdown>
              {displayTldr}
            </ReactMarkdown>
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
