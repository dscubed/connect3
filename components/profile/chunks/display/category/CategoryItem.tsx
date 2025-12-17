import { GripVertical, PlusCircle } from "lucide-react";
import { SortableCategory } from "./SortableCategory";
import { CategoryChunks } from "./CategoryChunks";
import { ChunkEntry, useChunkContext } from "../../hooks/ChunkProvider";
import { AllCategories, ChunkInput } from "../../ChunkUtils";
import { Fade } from "@/components/ui/Fade";

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
          className="mb-6 flex flex-col items-start align-start w-full"
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
                className="absolute left-0 mr-1 text-white/50 hover:cursor-grab"
              >
                <GripVertical />
              </Fade>
              {category}
            </h1>
            <Fade
              show={isEditing}
              className="cursor-pointer hover:text-white/70 transition-colors"
            >
              <PlusCircle
                className="h-5 w-5"
                onClick={() => {
                  setNewChunks((prev) => ({
                    ...prev,
                    [category]: { text: "", category },
                  }));
                }}
              />
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
