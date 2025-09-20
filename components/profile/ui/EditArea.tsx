interface EditAreaProps {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  maxLength?: number;
}

export function EditArea({
  value,
  onChange,
  onSave,
  onCancel,
  maxLength,
}: EditAreaProps) {
  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell us about yourself in a few sentences..."
        className="w-full h-32 bg-black border border-white/20 rounded p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:border-white/40"
        maxLength={maxLength}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">
          {value.length}/{maxLength} characters
        </span>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-white/20 bg-black text-white/70 hover:bg-black/20 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded border border-white/20 bg-white text-black hover:bg-white/80 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
