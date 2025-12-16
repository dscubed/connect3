import { GripVertical, PlusCircle } from "lucide-react";
import { SortableCategory } from "./SortableCategory";
import { CategoryChunks } from "./CategoryChunks";
import { ChunkEntry } from "../../hooks/ChunkProvider";
import { AllCategories, ChunkInput } from "../../ChunkUtils";

interface CategoryItemProps {
  category: AllCategories;
  chunks: ChunkEntry[];
  isEditing: boolean;
  newChunks: Record<AllCategories, ChunkInput>;
  setNewChunks: React.Dispatch<
    React.SetStateAction<Record<AllCategories, ChunkInput>>
  >;
  editChunks: Record<string, ChunkInput>;
  setEditChunks: React.Dispatch<
    React.SetStateAction<Record<string, ChunkInput>>
  >;
}

export function CategoryItem({
  category,
  chunks,
  isEditing,
  newChunks,
  setNewChunks,
  editChunks,
  setEditChunks,
}: CategoryItemProps) {
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
            className="flex items-center mb-2 gap-2 hover:bg-white/10 py-1 rounded-md w-full"
            {...(isEditing ? { ...attributes, ...listeners } : {})}
          >
            <h1
              className={`text-lg font-semibold relative flex items-center justify-center transition-all duration-300
                ${isEditing ? "pl-6" : "p-0"}`}
            >
              {isEditing && (
                <GripVertical className="absolute left-0 h-5 w-5 mr-1 text-white/50 hover:cursor-grab animate-fade-in" />
              )}
              {category}
            </h1>
            {isEditing && (
              <PlusCircle
                className="h-5 w-5 cursor-pointer hover:text-white/70 transition-colors animate-fade-in"
                onClick={() => {
                  setNewChunks((prev) => ({
                    ...prev,
                    [category]: { text: "", category },
                  }));
                }}
              />
            )}
          </div>
          {/* Category Chunks */}
          <CategoryChunks
            chunks={chunks}
            category={category}
            isEditing={isEditing}
            newChunks={newChunks}
            setNewChunks={setNewChunks}
            editChunks={editChunks}
            setEditChunks={setEditChunks}
          />
        </div>
      )}
    </SortableCategory>
  );
}
