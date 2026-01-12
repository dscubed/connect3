import { Textarea } from "@/components/ui/TextArea";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiEnhanceDialog } from "@/components/profile/edit-modals/AiEnhanceDialog";
import { CardContent } from "@/components/ui/card";
import { SectionCard, SectionCardHeader } from "./SectionCard";
import { useAuthStore } from "@/stores/authStore";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/profile/client";
import { PencilLine } from "lucide-react";

export function SummaryCard({
  editingProfile = false,
}: {
  editingProfile?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, updateProfile } = useAuthStore();
  const [newTldr, setNewTldr] = useState(profile?.tldr || "");

  const saveTldr = async (updatedTldr: string) => {
    updateProfile({ tldr: updatedTldr });
    uploadProfileToVectorStore();
  };

  useEffect(() => {
    if (isEditing) {
      setNewTldr(profile?.tldr || "");
    }
  }, [isEditing, profile?.tldr]);

  useEffect(() => {
    if (!editingProfile) {
      setIsEditing(false);
    }
  }, [editingProfile]);

  const editTldr = () => {
    if (!editingProfile) return;
    setIsEditing(true);
    setNewTldr(profile?.tldr || "");
  };

  const cancel = () => {
    setIsEditing(false);
    setNewTldr(profile?.tldr || "");
  };

  const submit = () => {
    setIsEditing(false);
    saveTldr(newTldr);
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
    <SectionCard className="mb-8">
      <SectionCardHeader title="Summary">
        {/* Enhance button (only when profile is in edit mode) */}

        {!editingProfile ? null : isEditing ? (
          <AiEnhanceDialog
            initialText={newTldr}
            fieldType="external_tldr"
            title="Enhance your TLDR"
            onApply={(updated) => {
              // Apply the improved/generate TLDR into the editor
              setNewTldr(updated);

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

      <CardContent className="w-full flex flex-col gap-2 !p-4 !pt-0">
        {isEditing ? (
          <>
            <Textarea
              value={newTldr}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewTldr(e.target.value)
              }
              className="w-full focus-visible:ring-0 resize-none min-h-0 border-none !text-lg placeholder:italic py-0 px-2 !leading-relaxed placeholder:text-muted"
              placeholder="Add a short summary of yourself to allow others to get to know you better and make your profile more discoverable."
              onKeyDown={handleKeyDown}
            />
            <div className="flex justify-end gap-2 animate-fade-in">
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
        ) : newTldr.length > 0 ? (
          <span className="leading-relaxed text-lg px-2" onClick={editTldr}>
            {newTldr}
          </span>
        ) : (
          <span
            className="flex leading-relaxed text-lg px-2 italic text-muted"
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
