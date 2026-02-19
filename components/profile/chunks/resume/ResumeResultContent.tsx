import { toast } from "sonner";
import { UserCategories } from "../ChunkUtils";
import { useChunkContext } from "../hooks/ChunkProvider";
import { ResumeChunkResult } from "./ChunkResumeModal";
import { SectionCard, SectionCardHeader } from "../../SectionCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

export function ResumeResultContent({
  result,
  onClose,
}: {
  result: ResumeChunkResult;
  onClose: () => void;
}) {
  const { updateChunk, addChunk } = useChunkContext();

  // Map results to category sections
  const updatedChunks = () => {
    const sections: {
      [key in UserCategories]?: { id: string; text: string }[];
    } = {};
    if (!result.updatedChunks) return sections;

    result.updatedChunks.forEach((chunk) => {
      if (!sections[chunk.category]) {
        sections[chunk.category] = [];
      }
      sections[chunk.category]!.push({ id: chunk.id, text: chunk.text });
    });
    return sections;
  };

  const newChunks = () => {
    const sections: { [key in UserCategories]?: { text: string }[] } = {};
    if (!result.newChunks) return sections;

    result.newChunks.forEach((chunk) => {
      if (!sections[chunk.category]) {
        sections[chunk.category] = [];
      }
      sections[chunk.category]!.push({ text: chunk.text });
    });
    return sections;
  };

  const updatedSections = updatedChunks();
  const newSections = newChunks();

  const hasUpdated = Object.values(updatedSections).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );
  const hasNew = Object.values(newSections).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );

  const applyChanges = () => {
    // Apply updated chunks
    result.updatedChunks.forEach((chunk) => {
      updateChunk({ id: chunk.id, category: chunk.category, text: chunk.text });
    });

    // Apply new chunks
    result.newChunks.forEach((chunk) => {
      addChunk(chunk.category, chunk.text);
    });

    onClose();
    toast.success("Resume chunks applied to profile successfully!");
  };

  return (
    <>
      <DialogTitle className="text-2xl font-semibold text-center text-white drop-shadow-md mb-2">
        Chunks Extracted from Resume
      </DialogTitle>
      <DialogDescription className="text-center text-white/80 mb-4 drop-shadow-sm">
        Review the chunks extracted from your resume. You can apply these
        changes to your profile.
      </DialogDescription>
      <div className="flex flex-col gap-4 p-6 rounded-lg max-h-[60vh] overflow-y-auto scrollbar-hide">
        {hasUpdated && (
          <>
            <h2 className="flex flex-row items-center gap-2 text-lg font-semibold text-white drop-shadow-sm">
              Updated Chunks
              <span className="flex justify-center items-center rounded-full p-2 bg-muted text-sm w-6 h-6">
                {Object.values(updatedSections).reduce(
                  (sum, arr) => sum + (arr ? arr.length : 0),
                  0
                )}
              </span>
            </h2>
            {Object.entries(updatedSections).map(([category, chunks]) => (
              <SectionCard variant="white" key={category} className="mb-2">
                <SectionCardHeader title={category} />
                <CardContent className="w-full flex flex-col gap-4 !p-4 !pt-0">
                  <ul className="list-disc list-inside space-y-2">
                    {chunks?.map((chunk, idx) => (
                      <li key={chunk.id || idx} className="text-base">
                        {chunk.text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </SectionCard>
            ))}
          </>
        )}

        {hasNew && (
          <>
            <h2 className="flex flex-row items-center gap-2 text-lg font-semibold text-white drop-shadow-sm">
              New Chunks
              <span className="flex justify-center items-center rounded-full p-2 bg-muted text-sm w-6 h-6">
                {Object.values(newSections).reduce(
                  (sum, arr) => sum + (arr ? arr.length : 0),
                  0
                )}
              </span>
            </h2>
            {Object.entries(newSections).map(([category, chunks]) => (
              <SectionCard variant="white" key={category} className="mb-2">
                <SectionCardHeader title={category} />
                <CardContent className="w-full flex flex-col gap-4 !p-4 !pt-0">
                  <ul className="list-disc list-inside space-y-2">
                    {chunks?.map((chunk, idx) => (
                      <li key={idx} className="text-base">
                        {chunk.text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </SectionCard>
            ))}
          </>
        )}

        {!hasUpdated && !hasNew && (
          <p className="text-gray-500">
            No chunks were extracted from the resume.
          </p>
        )}
      </div>
      <div className="flex flex-row gap-4 w-full justify-end mt-4">
        <Button
          variant="default"
          className="block shadow-lg hover:bg-background/80"
          onClick={onClose}
        >
          Cancel Upload
        </Button>
        <Button
          variant="default"
          className="block shadow-lg text-background bg-foreground hover:bg-foreground/80"
          onClick={applyChanges}
        >
          Apply Changes
        </Button>
      </div>
    </>
  );
}
