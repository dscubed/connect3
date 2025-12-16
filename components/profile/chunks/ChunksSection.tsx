"use client";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { useChunkContext } from "./hooks/ChunkProvider";
import { useEffect, useState } from "react";
import { PlusCircle, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Spinner } from "@/components/ui/spinner";
import {
  userCategoriesList,
  UserCategories,
  OrganisationCategories,
  organisationCategoriesList,
  ChunkInput,
  AllCategories,
} from "./ChunkUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { ChunkActions } from "./ChunkActions";
import { useDnd } from "./hooks/useDnD";
import { ChunkEditor } from "./ChunkEditor";
import { SortableChunk } from "./SortableChunk";
import { ChunkItem } from "./ChunkItem";

export default function ChunksSection() {
  const { fetchChunks } = useChunkContext();
  const [fetched, setFetched] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (fetched) return;
    fetchChunks();
    setFetched(true);
  }, [fetchChunks, fetched]);

  return (
    <div className="w-full flex flex-col gap-6 mb-12">
      {/* Chunk Actions - Edit mode, Upload Resume */}
      <ChunkActions isEditing={isEditing} setIsEditing={setIsEditing} />

      {/* Chunks */}
      <ChunksDisplay isEditing={isEditing} />
    </div>
  );
}

const LoadingState = (
  <div className="flex flex-col items-center justify-center h-32">
    <CubeLoader size={60} />
    <span className="text-white/70">Loading chunks...</span>
  </div>
);

const ChunksDisplay = ({ isEditing }: { isEditing: boolean }) => {
  const { orderedCategoryChunks, loadingChunks } = useChunkContext();
  const [newChunks, setNewChunks] = useState<Record<AllCategories, ChunkInput>>(
    {} as Record<AllCategories, ChunkInput>
  );
  const [editChunks, setEditChunks] = useState<Record<string, ChunkInput>>({});

  const { handleCategoryDragEnd, sensors, handleChunkDragEnd, categoryIds } =
    useDnd();

  // Reset newChunks when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      setNewChunks({} as Record<AllCategories, ChunkInput>);
      setEditChunks({});
    }
  }, [isEditing]);

  if (loadingChunks) {
    return LoadingState;
  }
  return (
    <div>
      {orderedCategoryChunks.length === 0 && !isEditing ? (
        <EmptyChunksState />
      ) : (
        <div className="flex flex-col gap-2 min-h-32 justify-center items-center w-full">
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
                <SortableCategory key={category} id={category}>
                  {({ attributes, listeners, setNodeRef, style }) => (
                    <div
                      ref={setNodeRef}
                      className="mb-8 flex flex-col items-start align-start w-full"
                      style={style}
                    >
                      {/* Category Header (Drag Handle) */}
                      <div
                        className="flex items-center mb-2 gap-2 hover:cursor-grab hover:bg-white/10 px-2 py-1 rounded-md w-full"
                        {...attributes}
                        {...listeners}
                      >
                        <h1 className="text-lg font-semibold">{category}</h1>
                        {isEditing && (
                          <PlusCircle
                            className="h-5 w-5 cursor-pointer hover:text-white/70 transition-colors"
                            onClick={() => {
                              setNewChunks((prev) => ({
                                ...prev,
                                [category]: { text: "", category },
                              }));
                            }}
                          />
                        )}
                      </div>
                      <ul className="space-y-2 w-full">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) =>
                            handleChunkDragEnd(event, chunks, category)
                          }
                        >
                          <SortableContext
                            items={chunks.map((chunk) => chunk.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {isEditing ? (
                              <>
                                {chunks.map((chunk) => (
                                  <SortableChunk key={chunk.id} chunk={chunk}>
                                    <ChunkItem
                                      chunk={chunk}
                                      category={category}
                                      isEditing={isEditing}
                                      editChunks={editChunks}
                                      setEditChunks={setEditChunks}
                                    />
                                  </SortableChunk>
                                ))}
                              </>
                            ) : (
                              <>
                                {chunks.map((chunk) => (
                                  <ChunkItem
                                    key={chunk.id}
                                    chunk={chunk}
                                    category={category}
                                    isEditing={isEditing}
                                    editChunks={editChunks}
                                    setEditChunks={setEditChunks}
                                  />
                                ))}
                              </>
                            )}
                          </SortableContext>
                        </DndContext>
                        {newChunks[category] && (
                          <li>
                            <ChunkEditor
                              chunk={
                                newChunks[category] || { text: "", category }
                              }
                              setChunk={(chunk) =>
                                setNewChunks((prev) => ({
                                  ...prev,
                                  [category]: chunk,
                                }))
                              }
                              cancel={() =>
                                setNewChunks((prev) => {
                                  const updated = { ...prev };
                                  delete updated[category];
                                  return updated;
                                })
                              }
                            />
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </SortableCategory>
              ))}
            </SortableContext>
          </DndContext>
          {isEditing && (
            <div className="flex flex-col gap-2 items-center justify-center w-full">
              <AddCategoryButton />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AddCategoryButton = () => {
  const { profile, loading } = useAuthStore.getState();
  const [selectedCategory, setSelectedCategory] =
    useState<AllCategories | null>(null);
  const { orderedCategoryChunks } = useChunkContext();
  const [chunk, setChunk] = useState<ChunkInput>({ text: "", category: null });

  let categoriesList: UserCategories[] | OrganisationCategories[] = [];
  if (profile?.account_type === "user") {
    categoriesList = userCategoriesList.filter(
      (category) =>
        !orderedCategoryChunks.find((cat) => cat.category === category)
    );
  } else if (profile?.account_type === "organisation") {
    categoriesList = organisationCategoriesList.filter(
      (category) =>
        !orderedCategoryChunks.find((cat) => cat.category === category)
    );
  }

  return (
    <div className="w-full flex flex-col items-start gap-2">
      {!profile || loading ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {selectedCategory ? (
              <h1 className="text-lg font-semibold mb-2">{selectedCategory}</h1>
            ) : (
              <div className="flex gap-2 items-center align-center cursor-pointer">
                <h1 className="text-lg font-semibold"> Add Category </h1>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={12}
            className="max-h-48 overflow-scroll scrollbar-hide"
          >
            {categoriesList.length === 0 ? (
              <DropdownMenuItem disabled>No categories left</DropdownMenuItem>
            ) : (
              categoriesList.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {selectedCategory && (
        <ChunkEditor
          chunk={{ ...chunk, category: selectedCategory }}
          setChunk={setChunk}
          cancel={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

const EmptyChunksState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-32 text-center text-white/70">
      <Sparkles className="h-8 w-8 mb-2 animate-pulse" />
      <h2 className="text-xl font-semibold mb-1">No chunks available</h2>
    </div>
  );
};

function SortableCategory({
  id,
  children,
}: {
  id: string;
  children: (props: {
    attributes: React.HTMLAttributes<HTMLElement>;
    listeners: React.DOMAttributes<HTMLElement>;
    setNodeRef: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
    isDragging: boolean;
  }) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };
  return children({
    attributes,
    listeners: listeners ?? {},
    setNodeRef,
    style,
    isDragging,
  });
}
