import { Textarea } from "@/components/ui/TextArea";
import { useChunkContext } from "../hooks/ChunkProvider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiEnhanceDialog } from "@/components/profile/edit-modals/AiEnhanceDialog";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

type ValidationResult = {
  safe: boolean;
  sensitive: boolean;
  relevant: boolean;
  categoryMatches: boolean;
  reason: string;
};

export function SummaryChunk() {
  const { tldr, isEditing, setNewTldr, newTldr, editingTldr, setEditingTldr } =
    useChunkContext();

  const { makeAuthenticatedRequest, user } = useAuthStore();

  const [prevTldr, setPrevTldr] = useState(tldr);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setPrevTldr(tldr);
    }
  }, [isEditing, tldr]);

  const editTldr = () => {
    setEditingTldr(true);
    setNewTldr(prevTldr);
  };

  const cancel = () => {
    setEditingTldr(false);
    setNewTldr(prevTldr);
  };

  const validateSummary = async (text: string) => {
    if (!user) {
      toast.error("You need to be signed in to save your summary.");
      return null;
    }

    const trimmed = text.trim();

    // Allow clearing the summary without validation
    if (trimmed.length === 0) {
      return {
        safe: true,
        sensitive: false,
        relevant: true,
        categoryMatches: true,
        reason: "Empty summary is allowed.",
      } as ValidationResult;
    }

    setIsValidating(true);
    try {
      const res = await makeAuthenticatedRequest(`/api/validate/chunks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          mode: "summary",
        }),
      });

      const data = (await res.json()) as ValidationResult;
      if (!res.ok) {
        throw new Error((data as any)?.error || "Validation failed");
      }

      return data;
    } catch (err) {
      console.error("summary validation error", err);
      toast.error("Could not validate right now. Please try again.");
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const submit = async () => {
    if (isValidating) return;

    const validation = await validateSummary(newTldr);
    if (!validation) return;

    if (!validation.safe) {
      toast.error(validation.reason || "This summary can't be saved.");
      return;
    }

    if (validation.sensitive) {
      toast.error(
        validation.reason ||
          "Please remove personal information before saving your summary."
      );
      return;
    }

    if (!validation.relevant) {
      toast.error(
        validation.reason || "This summary doesn't look like meaningful text."
      );
      return;
    }

    // Passed validation → accept the edit locally (persist happens when saveChunks runs)
    setEditingTldr(false);
    setPrevTldr(newTldr);
    toast.success("Summary saved.");
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
    <div className="mb-4 flex flex-col items-start justify-center w-full">
      <div className="w-full flex items-center justify-between mb-4">
        <h1 className="relative text-2xl font-semibold flex items-center justify-center transition-all duration-300">
          Summary
        </h1>

        {/* Enhance button (only when profile is in edit mode) */}
        {isEditing && editingTldr && (
          <AiEnhanceDialog
            initialText={newTldr}
            fieldType="external_tldr"
            triggerLabel="Enhance"
            title="Enhance your TLDR"
            onApply={(updated) => {
              setNewTldr(updated);
              if (!editingTldr) setEditingTldr(true);
            }}
          />
        )}
      </div>

      <div className="w-full flex flex-col gap-2">
        {editingTldr && isEditing ? (
          <>
            <Textarea
              value={newTldr}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewTldr(e.target.value)
              }
              className="w-full focus-visible:ring-0 resize-none min-h-0 border-none !text-lg placeholder:italic py-0 px-2"
              placeholder="Add a short summary of yourself to allow others to get to know you better and make your profile more discoverable."
              onKeyDown={handleKeyDown}
              disabled={isValidating}
            />

            <div className="flex justify-end gap-2 animate-fade-in">
              <Button variant="ghost" onClick={cancel} disabled={isValidating}>
                Cancel
              </Button>
              <Button variant="ghost" onClick={submit} disabled={isValidating}>
                {isValidating ? "Validating..." : "Save"}
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
      </div>
    </div>
  );
}
