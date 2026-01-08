import { Textarea } from "@/components/ui/TextArea";
import { useChunkContext } from "../hooks/ChunkProvider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiEnhanceDialog } from "@/components/profile/edit-modals/AiEnhanceDialog";

export function SummaryChunk() {
  const { tldr, isEditing, setNewTldr, newTldr, editingTldr, setEditingTldr } =
    useChunkContext();

  const [prevTldr, setPrevTldr] = useState(tldr);

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

  const submit = () => {
    setEditingTldr(false);
    setPrevTldr(newTldr);
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
              // Apply the improved/generate TLDR into the editor
              setNewTldr(updated);

              // If they weren’t already editing this field, open editing state
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
            />
            <div className="flex justify-end gap-2 animate-fade-in">
              <Button variant="ghost" onClick={cancel}>
                Cancel
              </Button>
              <Button variant="ghost" onClick={submit}>
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
      </div>
    </div>
  );
}