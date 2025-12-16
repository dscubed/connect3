import { useSortable } from "@dnd-kit/sortable";
import { ChunkEntry } from "./hooks/ChunkProvider";
import { CSS } from "@dnd-kit/utilities";

export function SortableChunk({
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
