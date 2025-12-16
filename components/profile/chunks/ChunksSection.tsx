"use client";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { ChunkEntry, useChunkContext } from "./hooks/ChunkProvider";
import { useEffect, useState } from "react";
import {
  FileUp,
  MessageCircle,
  Pencil,
  PencilOff,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Trash,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/TextArea";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

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
      <div className="flex justify-between">
        <div className="flex gap-4">
          {/* Edit and Refresh */}
          <div className="flex gap-8">
            {isEditing ? (
              <ActionButton
                icon={PencilOff}
                label="Done"
                onClick={() => setIsEditing(false)}
              />
            ) : (
              <ActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => setIsEditing(true)}
              />
            )}
            <ActionButton
              icon={RotateCcw}
              label="Refresh"
              onClick={() => fetchChunks()}
            />
          </div>
          {/* Separator */}
          <div className="border-l border-white/20 h-full py-4 self-center" />
          <div className="flex gap-8">
            <ActionButton icon={FileUp} label="Upload" />
            <ActionButton icon={MessageCircle} label="Chat" />
          </div>
        </div>
      </div>

      {/* Chunks */}
      <ChunksDisplay isEditing={isEditing} />
    </div>
  );
}

export // add export to avoid unused error
const LoadingState = (
  <div className="flex flex-col items-center justify-center h-32">
    <CubeLoader size={60} />
    <span className="text-white/70">Loading chunks...</span>
  </div>
);

const ChunksDisplay = ({ isEditing }: { isEditing: boolean }) => {
  const { orderedCategoryChunks, loadingChunks, removeChunk, moveChunk } =
    useChunkContext();
  const [newChunks, setNewChunks] = useState<Record<AllCategories, ChunkInput>>(
    {} as Record<AllCategories, ChunkInput>
  );
  const [editChunks, setEditChunks] = useState<Record<string, ChunkInput>>({});

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (
    event: DragEndEvent,
    chunks: ChunkEntry[],
    category: AllCategories
  ) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chunks.findIndex((c) => c.id === active.id);
      const newIndex = chunks.findIndex((c) => c.id === over.id);
      moveChunk(category, oldIndex, newIndex);
    }
  };

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
          {orderedCategoryChunks.map(({ category, chunks }) => (
            <div
              key={category}
              className="mb-8 flex flex-col items-start align-start w-full"
            >
              <div className="flex items-center mb-2 gap-2">
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
                  onDragEnd={(event) => handleDragEnd(event, chunks, category)}
                >
                  <SortableContext
                    items={chunks.map((chunk) => chunk.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {chunks.map((chunk) => (
                      <SortableChunk key={chunk.id} chunk={chunk}>
                        <li
                          onClick={() => {
                            setEditChunks((prev) => {
                              if (!isEditing) return prev;
                              return {
                                ...prev,
                                [chunk.id]: { text: chunk.text, category },
                              };
                            });
                          }}
                        >
                          {editChunks[chunk.id] ? (
                            <ChunkEditor
                              chunk={editChunks[chunk.id]}
                              setChunk={(updatedChunk) =>
                                setEditChunks((prev) => ({
                                  ...prev,
                                  [chunk.id]: updatedChunk,
                                }))
                              }
                              cancel={() =>
                                setEditChunks((prev) => {
                                  const updated = { ...prev };
                                  delete updated[chunk.id];
                                  return updated;
                                })
                              }
                              placeholder={`Edit ${category} chunk...`}
                              chunkId={chunk.id}
                            />
                          ) : (
                            <div className="flex items-baseline gap-2 rounded-lg w-full hover:bg-white/20">
                              <span
                                className="inline-block w-2 h-2 bg-white rounded-full"
                                aria-hidden="true"
                              />
                              <span className="flex-1 p-2 text-base">
                                {chunk.text}
                              </span>
                              {isEditing && (
                                <button
                                  type="button"
                                  className="p-1 text-white/70 hover:text-red-500 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeChunk(chunk.id);
                                  }}
                                  aria-label="Delete chunk"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </li>
                      </SortableChunk>
                    ))}
                  </SortableContext>
                </DndContext>
                {newChunks[category] && (
                  <li>
                    <ChunkEditor
                      chunk={newChunks[category] || { text: "", category }}
                      setChunk={(chunk) =>
                        setNewChunks((prev) => ({ ...prev, [category]: chunk }))
                      }
                      cancel={() =>
                        setNewChunks((prev) => {
                          const updated = { ...prev };
                          delete updated[category];
                          return updated;
                        })
                      }
                      placeholder={`Add a new ${category} chunk...`}
                    />
                  </li>
                )}
              </ul>
            </div>
          ))}
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
          placeholder={`Add a new ${selectedCategory} chunk...`}
          chunk={{ ...chunk, category: selectedCategory }}
          setChunk={setChunk}
          cancel={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

const ChunkEditor = ({
  placeholder = "Add a new chunk...",
  chunk,
  setChunk,
  cancel,
  chunkId = null,
}: {
  placeholder?: string;
  chunk: ChunkInput;
  setChunk: (chunk: ChunkInput) => void;
  cancel: () => void;
  chunkId?: string | null;
}) => {
  const { addChunk, setChunks } = useChunkContext();

  if (chunk.category === null) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (chunk.text.trim() === "") return;
      // If chunkId is provided, we're editing an existing chunk
      if (chunkId) {
        setChunks((prev) =>
          prev.map((c) =>
            c.id === chunkId ? { ...c, text: chunk.text.trim() } : c
          )
        );
      } else {
        addChunk(chunk.category!, chunk.text.trim());
      }
      setChunk({ text: "", category: null });
      cancel();
    }
    if (e.key === "Escape") {
      cancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChunk({ ...chunk, text: e.target.value });
  };

  return (
    <div className="flex items-baseline justify-center gap-2 w-full">
      <span
        className="inline-block w-2 h-2 bg-white rounded-full"
        aria-hidden="true"
      />
      <div className="flex w-full items-end gap-2">
        <Textarea
          className="flex-1 p-2 min-h-0 border-none outline-none focus-visible:ring-0 focus:ring-0 resize-none"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          value={chunk.text}
          rows={1}
        />
        <Button
          type="button"
          variant="ghost"
          className="h-10 px-2 py-1 text-xs flex items-end"
          style={{ pointerEvents: "auto" }}
        >
          <Sparkles className="h-4 w-4" /> Enhance
        </Button>
      </div>
    </div>
  );
};

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex flex-col items-center border-none p-0 m-0 hover:scale-105 text-white hover:text-white/70 transition-all min-w-8"
    >
      <Icon className="h-5 w-5 cursor-pointer transition-colors" />
      <span className="text-xs mt-1">{label}</span>
    </button>
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

function SortableChunk({
  chunk,
  children,
  ...props
}: {
  chunk: ChunkEntry;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chunk.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      {...props}
    >
      {children}
    </div>
  );
}
