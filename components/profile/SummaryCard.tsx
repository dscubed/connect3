import { Textarea } from "@/components/ui/TextArea";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiEnhanceDialog } from "@/components/profile/edit-modals/AiEnhanceDialog";
import { CardContent } from "@/components/ui/card";
import { SectionCard, SectionCardHeader } from "./SectionCard";
import { Profile, useAuthStore } from "@/stores/authStore";
import { uploadProfileToVectorStore } from "@/lib/vectorStores/profile/client";
import { PencilLine } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function SummaryCard({
  editingProfile = false,
  profile,
}: {
  editingProfile?: boolean;
  profile?: Profile;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTldr, setNewTldr] = useState(profile?.tldr || "");
  const { user } = useAuthStore();
  const saveTldr = async (updatedTldr: string) => {
    if (profile && profile.id === user?.id) {
      useAuthStore.getState().updateProfile({ tldr: updatedTldr });
      uploadProfileToVectorStore();
    } else {
      toast.error("Cannot update TLDR for other users' profiles.");
    }
  };

  useEffect(() => {
    if (profile) {
      setNewTldr(profile.tldr || "");
    } else {
      setNewTldr("");
    }
  }, [profile]);

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
    <SectionCard className="mb-4">
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

      <CardContent className="w-full flex flex-col gap-4 !p-4 !pt-0">
        {isEditing ? (
          <>
            <Textarea
              value={newTldr}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewTldr(e.target.value)
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
        ) : newTldr.length > 0 ? (
          <div className="leading-relaxed text-base" onClick={editTldr}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mt-3 mb-1">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mt-2 mb-1">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-2 last:mb-0">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-2 last:mb-0">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="my-0.5">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
              }}
            >
              {newTldr}
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
