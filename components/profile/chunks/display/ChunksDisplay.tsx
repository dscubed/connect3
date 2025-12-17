import { useEffect, useState } from "react";
import { AllCategories, ChunkInput } from "../ChunkUtils";
import { useChunkContext } from "../hooks/ChunkProvider";
import { useDnd } from "../hooks/useDnD";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CategoryItem } from "./category/CategoryItem";
import { AddCategoryButton } from "../AddCategoryButton";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { Sparkles } from "lucide-react";
import { Fade } from "@/components/ui/Fade";

export function ChunksDisplay() {
  const { orderedCategoryChunks, loadingChunks, setEditChunks, isEditing } =
    useChunkContext();
  const [newChunks, setNewChunks] = useState<Record<AllCategories, ChunkInput>>(
    {} as Record<AllCategories, ChunkInput>
  );
  const { handleCategoryDragEnd, sensors, categoryIds } = useDnd();

  // Reset newChunks when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      setNewChunks({} as Record<AllCategories, ChunkInput>);
      setEditChunks({});
    }
  }, [isEditing, setEditChunks]);

  if (loadingChunks) {
    return (
      <div className="flex flex-col items-center justify-center h-32">
        <CubeLoader size={60} />
        <span className="text-white/70">Loading chunks...</span>
      </div>
    );
  }
  return (
    <div>
      {orderedCategoryChunks.length === 0 && !isEditing ? (
        <EmptyChunksState />
      ) : (
        <div
          className={`flex flex-col gap-2 min-h-32 items-center w-full ${
            !isEditing ? "mb-16 justify-start" : "justify-center"
          }`}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={categoryIds}
              strategy={verticalListSortingStrategy}
            >
              {orderedCategoryChunks.map(({ category, chunks }) => (
                <CategoryItem
                  key={category}
                  category={category}
                  chunks={chunks}
                  newChunks={newChunks}
                  setNewChunks={setNewChunks}
                />
              ))}
            </SortableContext>
          </DndContext>
          <Fade
            show={isEditing}
            className="flex flex-col gap-2 items-center justify-center w-full"
          >
            <AddCategoryButton />
          </Fade>
        </div>
      )}
    </div>
  );
}

const EmptyChunksState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-32 text-center text-white/70">
      <Sparkles className="h-8 w-8 mb-2 animate-pulse" />
      <h2 className="text-xl font-semibold mb-1">No chunks available</h2>
    </div>
  );
};
