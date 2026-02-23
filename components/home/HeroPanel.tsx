import React from "react";
import { cn } from "@/lib/utils";
import { getMeshGradientStyle } from "@/lib/gradientUtils";

interface HeroPanelProps {
  heading: string;
  description: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** RGB for mesh gradient background; if omitted, uses white */
  gradientRgb?: [number, number, number];
}

export function HeroPanel({
  heading,
  description,
  children,
  className,
  gradientRgb,
}: HeroPanelProps) {
  const cardStyle = gradientRgb
    ? {
        ...getMeshGradientStyle(gradientRgb[0], gradientRgb[1], gradientRgb[2]),
        backgroundColor: `rgb(${gradientRgb[0]}, ${gradientRgb[1]}, ${gradientRgb[2]})`,
      }
    : undefined;

  return (
    <div className={cn("flex flex-row md:flex-col gap-4 md:gap-3", className)}>
      <div
        className={cn(
          "rounded-2xl aspect-square flex items-center justify-center overflow-hidden w-36 shrink-0 md:w-full",
          !gradientRgb && "bg-white"
        )}
        style={cardStyle}
      >
        {children}
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="text-lg md:text-xl font-medium text-black mb-1">
          {heading}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
