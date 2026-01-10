import { Textarea } from "@/components/ui/TextArea";
import { useChunkContext } from "../hooks/ChunkProvider";
import { Button } from "@/components/ui/button";
import { AllCategories, ChunkInput } from "../ChunkUtils";
import { AiEnhanceDialog } from "@/components/profile/edit-modals/AiEnhanceDialog";

export function ChunkEditor({
  cancel,
  chunk,
  setChunk,
  chunkId,
}: {
  cancel: () => void;
  chunk: ChunkInput;
  setChunk: (chunk: ChunkInput) => void;
  chunkId?: string;
}) {
  const { addChunk, updateChunk } = useChunkContext();

  if (chunk.category === null) return null;

  const submit = () => {
    if (chunk.text.trim() === "") return;
    // If chunkId is provided, we're editing an existing chunk
    if (chunkId) {
      updateChunk({
        id: chunkId,
        text: chunk.text.trim(),
        category: chunk.category!,
      });
    } else {
      addChunk(chunk.category!, chunk.text.trim());
    }

    cancel();
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
          <Textarea
            className="flex-1 p-2 min-h-0 border-none outline-none focus-visible:ring-0 focus:ring-0 resize-none !text-lg"
            placeholder={CATEGORY_PLACEHOLDERS[chunk.category]}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            value={chunk.text}
            rows={1}
          />
          <div className="items-end min-h-10">
            <AiEnhanceDialog
              initialText={chunk.text}
              fieldType="chunk"
              title="Enhance this highlight"
              onApply={(newText) => {
                // update what's shown in the editor immediately
                setChunk({ ...chunk, text: newText });

                // if editing an existing chunk, update it in the store too
                if (chunkId) {
                  updateChunk({
                    id: chunkId,
                    text: newText,
                    category: chunk.category!,
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-end gap-2">
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
