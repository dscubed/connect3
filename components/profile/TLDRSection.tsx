"use client";
import { Edit3 } from "lucide-react";
import { useState } from "react";
import { EditArea } from "@/components/profile/ui/EditArea";

interface TLDRSectionProps {
  tldr: string | null;
}

interface DisplayAreaProps {
  content: string | null;
  onEdit: () => void;
  placeholder?: string;
}

function DisplayArea({ content, onEdit, placeholder }: DisplayAreaProps) {
  return (
    <p
      className="text-white/70 leading-relaxed text-lg cursor-pointer hover:text-white transition"
      onClick={onEdit}
    >
      {content || (
        <span className="text-white/40 italic">
          {placeholder || "Click to edit..."}
        </span>
      )}
    </p>
  );
}

export default function TLDRSection({ tldr }: TLDRSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tldr || "");

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(tldr || "");
    setIsEditing(false);
  };

  if (!tldr && !isEditing) return null;

  return (
    <div className="mb-12">
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">tldr</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded border border-white/20 bg-black/10 hover:bg-black/20 transition"
            >
              <Edit3 className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
        {isEditing ? (
          <EditArea
            value={editValue}
            onChange={setEditValue}
            onSave={handleSave}
            onCancel={handleCancel}
            maxLength={300}
          />
        ) : (
          <DisplayArea content={tldr} onEdit={() => setIsEditing(true)} />
        )}
      </div>
    </div>
  );
}
