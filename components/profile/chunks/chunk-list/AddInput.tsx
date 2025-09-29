import { Loader2 } from "lucide-react";
import React, { useRef, useEffect } from "react";

interface AddInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function AddInput({
  value,
  onChange,
  onSave,
  onCancel,
  disabled,
}: AddInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea height as user types
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
    onChange(e);
  };

  // Expand on mount and when value changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        className="bg-transparent text-white/70 leading-relaxed outline-none resize-none block w-full"
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (
            (e.key === "Enter" && (e.ctrlKey || e.metaKey)) ||
            e.key === "Escape"
          ) {
            if (e.key === "Escape") {
              onCancel();
            } else {
              onSave();
            }
          }
        }}
        placeholder="Type new chunk..."
        autoFocus
        rows={1}
        style={{ overflow: "hidden" }}
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="min-w-[90px] px-4 py-2 rounded border border-white/20 bg-black text-white/70 hover:bg-black/20 transition"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="min-w-[90px] px-4 py-2 rounded border border-white/20 bg-white text-black hover:bg-white/80 transition flex justify-center items-center"
          type="button"
          disabled={value.trim().length === 0 || disabled}
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin text-black" />
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
}
