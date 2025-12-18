import { GripVertical, PlusCircle } from "lucide-react";
import { SortableCategory } from "./SortableCategory";
import { CategoryChunks } from "./CategoryChunks";
import { ChunkEntry, useChunkContext } from "../../hooks/ChunkProvider";
import { AllCategories, ChunkInput } from "../../ChunkUtils";
import { Fade } from "@/components/ui/Fade";
import { Button } from "@/components/ui/button";

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
        <div
          ref={setNodeRef}
          className="mb-2 flex flex-col items-start align-start w-full"
          style={style}
        >
          {/* Category Header (Drag Handle) */}
          <div
            className="flex items-center align-center mb-2 gap-2 hover:bg-white/10 rounded-md w-full"
            {...(isEditing ? { ...attributes, ...listeners } : {})}
          >
            <h1
              className={`relative text-lg font-semibold flex items-center justify-center transition-all duration-300
                ${isEditing ? "pl-6" : "p-0"}`}
            >
              <Fade
                show={isEditing}
                className="absolute left-0 mr-1 hover:cursor-grab"
              >
                <GripVertical className="h-5 w-5" />
              </Fade>
              {category}
            </h1>
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
          </div>
          {/* Category Chunks */}
          <CategoryChunks
            chunks={chunks}
            category={category}
            newChunks={newChunks}
            setNewChunks={setNewChunks}
          />
        </div>
      )}
    </SortableCategory>
  );
}
