import { useChunkContext } from "../hooks/ChunkProvider";
import { useDnd } from "../hooks/useDnD";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CategoryItem } from "./category/CategoryItem";
import { AddCategoryButton } from "../AddCategoryButton";
import { CubeLoader } from "@/components/ui/CubeLoader";

export function ChunksDisplay() {
  const { orderedCategoryChunks, loadingChunks, isEditing } = useChunkContext();
  const { handleCategoryDragEnd, sensors, categoryIds } = useDnd();

  if (loadingChunks) {
    return (
      <div className="flex flex-col items-center justify-center h-32">
        <CubeLoader size={60} />
        <span className="text-muted">Loading chunks...</span>
      </div>
    );
  }
  return (
    <div>
      <div
        className={`flex flex-col gap-4 min-h-32 items-center w-full ${
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
            {orderedCategoryChunks.map(({ category, chunks }, index) => (
              <CategoryItem key={index} category={category} chunks={chunks} />
            ))}
          </SortableContext>
        </DndContext>
        {isEditing && (
          <div className="flex flex-col gap-2 items-center justify-center w-full">
            <AddCategoryButton />
          </div>
        )}
      </div>
    </div>
  );
}
