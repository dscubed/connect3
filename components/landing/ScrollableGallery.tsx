"use client";

import type React from "react";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface ScrollableGalleryProps {
  children: ReactNode;
  className?: string;
  blurWidth?: "sm" | "md" | "lg"; // Controls blur fade width
  autoCenter?: boolean; // Whether to auto-center on mount
  centerKey?: string | number; // When this changes, re-center (like selectedUseCase)
  gap?: "sm" | "md" | "lg"; // Gap between items
  enableDrag?: boolean; // Enable drag to scroll
  autoPlay?: boolean; // Enable infinite auto-scroll
  autoPlaySpeed?: number; // Speed in milliseconds
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
}

const blurWidths = {
  sm: "w-4 md:w-8",
  md: "w-6 md:w-16",
  lg: "w-8 md:w-24",
};

const gaps = {
  sm: "gap-3 md:gap-4",
  md: "gap-4 md:gap-5",
  lg: "gap-6 md:gap-8",
};

export function ScrollableGallery({
  children,
  className = "",
  blurWidth = "md",
  autoCenter = false,
  centerKey,
  gap = "md",
  enableDrag = true,
  autoPlay = false,
  autoPlaySpeed = 3000,
  onMouseDown: externalMouseDown,
  onMouseUp: externalMouseUp,
  onMouseLeave: externalMouseLeave,
  onMouseEnter: externalMouseEnter,
}: ScrollableGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-center logic - simple and clean
  useEffect(() => {
    if (!autoCenter) return;

    const container = scrollContainerRef.current;
    if (container) {
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const centerPosition = (scrollWidth - clientWidth) / 2;
      container.scrollLeft = centerPosition;
    }
  }, [autoCenter, centerKey]); // Only depends on autoCenter and centerKey

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay || isDragging) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;
        
        if (currentScroll >= maxScroll) {
          // Reset to beginning for infinite loop
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll forward
          container.scrollBy({ left: 200, behavior: 'smooth' });
        }
      }, autoPlaySpeed);
    };

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlaySpeed, isDragging]);

  // Pause auto-play on hover
  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeave = () => {
    // Handle auto-play resume
    if (autoPlay && !isDragging) {
      const container = scrollContainerRef.current;
      if (!container) return;

      autoPlayRef.current = setInterval(() => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;
        
        if (currentScroll >= maxScroll) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 200, behavior: 'smooth' });
        }
      }, autoPlaySpeed);
    }

    // Handle drag state
    if (enableDrag) {
      setIsDragging(false);
      const container = scrollContainerRef.current;
      if (container) {
        container.style.cursor = "grab";
      }
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableDrag) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = "grabbing";
  };

  const handleMouseUp = () => {
    if (!enableDrag) return;

    setIsDragging(false);
    const container = scrollContainerRef.current;
    if (container) {
      container.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableDrag || !isDragging) return;
    e.preventDefault();

    const container = scrollContainerRef.current;
    if (!container) return;

    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Left blur fade */}
      <div
        className={`absolute left-0 top-0 z-10 ${blurWidths[blurWidth]} h-full bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none`}
      />

      {/* Right blur fade */}
      <div
        className={`absolute right-0 top-0 z-10 ${blurWidths[blurWidth]} h-full bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none`}
      />

      <div
        ref={scrollContainerRef}
        className={`w-full overflow-x-auto scrollbar-hide ${
          enableDrag ? "cursor-grab active:cursor-grabbing select-none" : ""
        }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseDown={(e) => {
          handleMouseDown(e);
          externalMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          handleMouseUp();
          externalMouseUp?.(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={(e) => {
          handleMouseLeave();
          externalMouseLeave?.(e);
        }}
        onMouseEnter={(e) => {
          handleMouseEnter();
          externalMouseEnter?.(e);
        }}
      >
        <div className="flex py-4">
          {/* Outer flex with py-4 only */}
          <div className={`flex items-center ${gaps[gap]} px-6 md:px-16`}>
            {/* Inner flex with gap and padding */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
