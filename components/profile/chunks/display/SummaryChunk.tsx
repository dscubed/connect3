import { Textarea } from "@/components/ui/TextArea";
import { useChunkContext } from "../hooks/ChunkProvider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
      <h1 className="relative text-2xl font-semibold flex items-center justify-center transition-all duration-300 mb-4">
        Summary
      </h1>
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
              <Button
                variant="ghost"
                onClick={() => {
                  cancel();
                }}
              >
                Cancel
              </Button>
              <Button variant="ghost" onClick={() => submit()}>
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
