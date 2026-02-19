import { cn } from "@/lib/utils";
import { Card, CardHeader } from "../ui/card";
import React, { createContext, forwardRef, useContext } from "react";
import { GripVertical, PencilLine } from "lucide-react";

type ColorVariant = "default" | "blue" | "muted" | "white";

const colorVariants = {
  default: {
    card: "bg-card/50 border-foreground/30",
    header: "bg-foreground/30",
  },
  blue: {
    card: "bg-blue-100 border-blue-300",
    header: "bg-blue-300",
  },
  muted: {
    card: "bg-muted/10 border-muted/50",
    header: "bg-muted/50",
  },
  white: {
    card: "bg-white border-gray-200",
    header: "bg-gray-200",
  },
};

export const CardColorContext = createContext<{
  variant: ColorVariant;
}>({ variant: "default" });

export const SectionCard = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Card> & { variant?: ColorVariant }
>(({ className, children, variant = "default", ...props }, ref) => {
  return (
    <CardColorContext.Provider value={{ variant }}>
      <Card
        ref={ref}
        className={cn(
          "flex flex-col items-start justify-center w-full mb-6 shadow-none",
          colorVariants[variant].card,
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </CardColorContext.Provider>
  );
});
SectionCard.displayName = "SectionCard";

export function SectionCardHeader({
  title,
  className,
  children,
  onTitleClick,
  titleIcon,
  dragHandleProps,
  showDragHandle,
  ...props
}: {
  title: string | React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onTitleClick?: () => void;
  titleIcon?: React.ReactNode;
  dragHandleProps?: React.HTMLAttributes<HTMLElement> & React.DOMAttributes<HTMLElement>;
  showDragHandle?: boolean;
}) {
  const { variant } = useContext(CardColorContext);
  const pillClasses = `inline-flex items-center gap-1.5 px-3 py-1 ${colorVariants[variant].header} rounded-2xl relative text-base font-medium transition-all duration-300`;
  const showGrip = dragHandleProps || showDragHandle;

  return (
    <CardHeader
      className={cn("w-full flex flex-row items-center justify-between gap-2 !px-4 !pt-4 !pb-3 !space-y-0", className)}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showGrip && (
          <div
            {...(dragHandleProps || {})}
            className={cn(
              "flex items-center shrink-0 text-muted",
              dragHandleProps ? "cursor-grab active:cursor-grabbing touch-none hover:text-foreground" : "cursor-default"
            )}
          >
            <GripVertical className="size-4" />
          </div>
        )}
        <h1
          className={cn(pillClasses, "w-fit shrink-0")}
          {...(!showGrip ? props : {})}
        >
          {onTitleClick ? (
            <button
              type="button"
              onClick={onTitleClick}
              className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity text-left"
            >
              {titleIcon ?? <PencilLine className="size-3.5 shrink-0 text-muted" />}
              <span>{title}</span>
            </button>
          ) : (
            title
          )}
        </h1>
      </div>
      <div className="flex items-center shrink-0">{children}</div>
    </CardHeader>
  );
}
