import { PlusCircle } from "lucide-react";
import { SortableCategory } from "./SortableCategory";
import { CategoryChunks } from "./CategoryChunks";
import { ChunkEntry } from "../../ChunkUtils";
import { useChunkContext } from "@/components/profile/chunks/hooks/ChunkProvider";
import { AllCategories, ChunkInput } from "../../ChunkUtils";
import { Fade } from "@/components/ui/Fade";
import { Button } from "@/components/ui/button";
import {
  SectionCard,
  SectionCardHeader,
} from "@/components/profile/SectionCard";
import { CardContent } from "@/components/ui/card";

interface CategoryItemProps {
  category: AllCategories;
  chunks: ChunkEntry[];
  newChunks: Record<AllCategories, ChunkInput>;
  setNewChunks: React.Dispatch<
    React.SetStateAction<Record<AllCategories, ChunkInput>>
  >;
}

export function CategoryItem({
  category,
  chunks,
  newChunks,
  setNewChunks,
}: CategoryItemProps) {
  const { isEditing } = useChunkContext();
  return (
    <SortableCategory key={category} id={category}>
      {({ attributes, listeners, setNodeRef, style }) => (
        <SectionCard
          className="mb-2 flex flex-col items-start align-start w-full"
          style={style}
          ref={setNodeRef}
          variant="white"
        >
          {/* Category Header (Drag Handle) */}
          <SectionCardHeader
            title={category}
            {...(isEditing ? { ...attributes, ...listeners } : {})}
          >
            <Fade
              show={isEditing}
              className="flex items-center cursor-pointer transition-colors"
            >
              <Button
                onClick={() => {
                  setNewChunks((prev) => ({
                    ...prev,
                    [category]: { text: "", category },
                  }));
                }}
                variant={"ghost"}
                className="px-2 py-1 h-fit"
              >
                <PlusCircle className="!size-5" />
              </Button>
            </Fade>
          </SectionCardHeader>
          <CardContent className="w-full">
            {/* Category Chunks */}
            <CategoryChunks
              chunks={chunks}
              category={category}
              newChunks={newChunks}
              setNewChunks={setNewChunks}
            />
          </CardContent>
        </SectionCard>
      )}
    </SortableCategory>
  );
}
