"use client";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { AiEnhanceDialog } from "@/components/profile/edit-modals/AiEnhanceDialog";
import { Button } from "@/components/ui/button";

interface TLDRSectionProps {
  tldr: string | null;
}

export default function TLDRSection({ tldr }: TLDRSectionProps) {
  const [localTldr, setLocalTldr] = useState(tldr ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user, updateProfile } = useAuthStore();

  // Keep in sync with server value when NOT editing
  useEffect(() => {
    if (!isEditing) {
      setLocalTldr(tldr ?? "");
    }
  }, [tldr, isEditing]);

  const handleEditOrSave = async () => {
    if (!user) return;

    // If not currently editing → enter edit mode
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // If editing → Save
    setIsSaving(true);
    try {
      await updateProfile({ tldr: localTldr });
      toast.success("TLDR saved.");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save TLDR.");
    } finally {
      setIsSaving(false);
    }
  };

  // When the AI modal applies changes:
  // - update local state
  // - persist the final TLDR via updateProfile
  const handleApplyFromAi = async (newText: string) => {
    if (!user) return;

    setLocalTldr(newText);
    setIsSaving(true);
    try {
      await updateProfile({ tldr: newText });
      toast.success("TLDR enhanced and saved.");
      setIsEditing(false); // optional: drop out of edit mode if they were editing
    } catch (err) {
      console.error(err);
      toast.error("Failed to save enhanced TLDR.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">tldr</h2>

          <div className="flex items-center gap-2">
            {/* Edit / Save toggle button */}
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleEditOrSave}
              disabled={isSaving}
              className="gap-1 rounded-2xl bg-background/60 hover:bg-background/80 border border-foreground/20 text-foreground/80"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Saving...</span>
                </>
              ) : (
                <span className="text-xs">{isEditing ? "Save" : "Edit"}</span>
              )}
            </Button>

            {/* NEW: AI Enhance dialog (chat-style) */}
            <AiEnhanceDialog
              initialText={localTldr}
              fieldType="external_tldr"
              onApply={handleApplyFromAi}
              title="Enhance your TLDR"
              triggerLabel="Enhance"
            />
          </div>
        </div>

        {/* Display mode vs edit mode */}
        {isEditing ? (
          <textarea
          className="w-full bg-background border border-border rounded-md p-3 text-foreground text-base leading-relaxed min-h-[96px] outline-none focus:ring-2 focus:ring-ring resize-vertical"
            value={localTldr}
            onChange={(e) => setLocalTldr(e.target.value)}
            placeholder="Write a short summary of yourself (e.g. degree, interests, key projects)."
          />
        ) : (
          <p className="text-black/70 leading-relaxed text-lg">
            {localTldr ? (
              localTldr
            ) : (
              <span className="text-black/40 italic">
                Click “Edit” to write a short summary of yourself, or use
                “Enhance” to get help from AI.
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
