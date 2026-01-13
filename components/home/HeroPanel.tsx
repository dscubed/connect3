"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface HeroPanelProps {
  title: string;
  flipText: string;
  children?: React.ReactNode;
  className?: string;
}

export function HeroPanel({
  title,
  flipText,
  children,
  className,
}: HeroPanelProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={cn("w-64 h-64 perspective-1000", className)}
      onClick={handleClick}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-md overflow-hidden flex flex-col items-center">
          {/* Background SVG - fills entire card */}
          {children}

          {/* Title - on top of SVG */}
          <h2 className="relative z-10 text-md font-medium text-muted select-none">
            {title}
          </h2>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border border-black/10 shadow-md overflow-hidden flex flex-col items-center p-6">
          {/* Title - same position as front */}
          <h2 className="text-md font-medium text-muted select-none">
            {title}
          </h2>

          {/* Flip text - centered in remaining space */}
          <div className="flex-1 flex items-center">
            <p className="text-md text-muted/60 text-center font-medium">
              {flipText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
