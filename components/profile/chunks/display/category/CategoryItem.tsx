import { SortableCategory } from "./SortableCategory";
import { CategoryChunks } from "./CategoryChunks";
import { ChunkEntry } from "../../ChunkUtils";
import { useChunkContext } from "@/components/profile/chunks/hooks/ChunkProvider";
import { AllCategories } from "../../ChunkUtils";
import {
  SectionCard,
  SectionCardHeader,
} from "@/components/profile/SectionCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface CategoryItemProps {
  category: AllCategories;
  chunks: ChunkEntry[];
}

export function CategoryItem({ category, chunks }: CategoryItemProps) {
  const {
    isEditing,
    editCategory,
    isEditingCategory,
    saveEdits,
    cancelEdits,
    focusedChunkId,
    focusDiv,
    cancelDivFocus,
    focusedDiv,
  } = useChunkContext();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !focusedChunkId[category] &&
        focusedDiv === category
      ) {
        cancelDivFocus(category);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedChunkId, focusedDiv, category, cancelDivFocus]);

  return (
    <SortableCategory key={category} id={category}>
      {({ attributes, listeners, setNodeRef, style }) => (
        <SectionCard
          className="mb-2 flex flex-col items-start align-start w-full"
          style={style}
          ref={setNodeRef}
          onClick={() => focusDiv(category)}
          variant="white"
        >
          {/* Category Header (Drag Handle) */}
          <SectionCardHeader
            title={category}
            {...(isEditing ? { ...attributes, ...listeners } : {})}
          >
            {!isEditingCategory(category) && isEditing && (
              <Button
                variant="ghost"
                className="!bg-transparent !text-muted rounded-full border border-muted/50 !p-1.5 h-fit"
                onClick={() => editCategory(category)}
              >
                <PencilLine className="!size-4" />
              </Button>
            )}
          </SectionCardHeader>
          <CardContent className="w-full">
            {/* Category Chunks */}
            <CategoryChunks chunks={chunks} category={category} />
            {isEditingCategory(category) && (
              <div className="w-full flex flex-row justify-end mt-2 gap-2">
                <Button
                  variant="ghost"
                  onClick={() => saveEdits(category)}
                  className={cn(
                    "!bg-transparent text-muted hover:text-card-foreground"
                  )}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => cancelEdits(category)}
                  className={cn(
                    "!bg-transparent text-muted hover:text-card-foreground"
                  )}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </SectionCard>
      )}
    </SortableCategory>
  );
}
