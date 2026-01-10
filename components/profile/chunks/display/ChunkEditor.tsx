import { useChunkContext } from "../hooks/ChunkProvider";
import { AllCategories, ChunkInput } from "../ChunkUtils";
import { AiEnhanceDialog } from "@/components/profile/edit-modals/AiEnhanceDialog";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

export function ChunkEditor({
  chunk,
  setChunk,
}: {
  chunk: ChunkInput;
  setChunk: (chunk: ChunkInput) => void;
}) {
  const { changeFocus, clearFocus, removeChunk } = useChunkContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!chunk.category || !chunk.id) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === "Enter" && !e.shiftKey) ||
      e.key === "Tab" ||
      e.key === "ArrowDown"
    ) {
      if (chunk.text.trim() === "") return;
      e.preventDefault();
      changeFocus(chunk.category, "next");
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      changeFocus(chunk.category, "back");
      if (chunk.text.trim() === "") removeChunk(chunk.id);
    }
    if (chunk.text === "" && e.key === "Backspace") {
      e.preventDefault();
      changeFocus(chunk.category, "back");
      removeChunk(chunk.id);
    }
    if (e.key === "Escape") {
      clearFocus(chunk.category);
      if (chunk.text.trim() === "") removeChunk(chunk.id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChunk({ ...chunk, text: e.target.value });
  };

  return (
    <div>
      <div className="flex items-baseline justify-center gap-2 w-full">
        <span
          className="inline-block w-2 h-2 bg-black rounded-full"
          aria-hidden="true"
        />
        <div className="flex w-full items-end gap-2">
          <Input
            ref={inputRef}
            className="flex-1 p-2 min-h-0 border-none outline-none shadow-none focus-visible:ring-0 focus:ring-0 resize-none !text-lg"
            placeholder={CATEGORY_PLACEHOLDERS[chunk.category]}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            value={chunk.text}
          />
          <div className="items-end min-h-10">
            <AiEnhanceDialog
              initialText={chunk.text}
              fieldType="chunk"
              title="Enhance this highlight"
              onApply={(newText) => {
                setChunk({ ...chunk, text: newText });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_PLACEHOLDERS: Record<AllCategories, string> = {
  Experience: "Describe your work experience, club committees, internships...",
  Education:
    "Describe your educational background, degrees, instituions, duration, etc...",
  Languages: "List the languages you know, years of experience, proficiency...",
  Skills: "List your skills, years of experience, proficiency...",
  Projects: "Describe your projects...",
  Certifications:
    "List your certifications or licenses, issuing organisations, expiry dates...",
  Courses:
    "List courses you've taken, when did you take them, subject codes...",
  Honors: "Describe any honors or awards you've received, when, from whom...",
  Hobbies:
    "Describe your personal hobbies and interests, sports, movies, music...",
  Volunteering:
    "Describe your volunteering experiences, organizations, roles...",
  Recruitment:
    "Describe your recruitment status, availability, open roles, recruitment period...",
  "What we do":
    "Describe what you offer, competitions, workshops, study sessions...",
  Perks: "List the perks of becoming a member, discounts, benefits...",
};
