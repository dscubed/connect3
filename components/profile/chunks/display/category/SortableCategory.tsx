import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

interface SortableCategoryProps {
  id: string;
  children: (props: {
    attributes: React.HTMLAttributes<HTMLElement>;
    listeners: React.DOMAttributes<HTMLElement>;
    setNodeRef: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
    isDragging: boolean;
  }) => React.ReactNode;
}

export function SortableCategory({ id, children }: SortableCategoryProps) {
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
  return (
    <>
      {children({
        attributes,
        listeners: listeners ?? {},
        setNodeRef,
        style,
        isDragging,
      })}
    </>
  );
}
