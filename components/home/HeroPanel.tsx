import React from "react";
import { cn } from "@/lib/utils";

interface HeroPanelProps {
  heading: string;
  description: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function HeroPanel({
  heading,
  description,
  children,
  className,
}: HeroPanelProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="rounded-2xl bg-white aspect-square flex items-center justify-center overflow-hidden">
        {children}
      </div>
      <div>
        <h3 className="text-xl font-medium text-black mb-1">
          {heading}
        </h3>
        <p className="text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
