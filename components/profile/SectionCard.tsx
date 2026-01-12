import { cn } from "@/lib/utils";
import { Card, CardHeader } from "../ui/card";
import React, { createContext, forwardRef, useContext } from "react";

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
          "flex flex-col items-start justify-center w-full mb-6",
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
  ...props
}: {
  title: string | React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const { variant } = useContext(CardColorContext);

  return (
    <CardHeader
      className={`w-full flex flex-row items-center justify-between mb-2 !p-4 ${className}`}
    >
      <h1
        className={`px-4 py-1 my-2 ${colorVariants[variant].header} rounded-2xl relative text-base font-medium transition-all duration-300`}
        {...props}
      >
        {title}
      </h1>
      <div>{children}</div>
    </CardHeader>
  );
}
