"use client";

import React, { useRef } from "react";
import { HeroPanel } from "./HeroPanel";
import { clubsPanelSVG, usersPanelSVG } from "./PanelSVGs";

export function HeroPanels() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const cards = [
    {
      title: "Clubs",
      svg: clubsPanelSVG,
      flipText:
        "Connect3 allows you to discover and join clubs that match your interests.",
    },
    {
      title: "Users",
      svg: usersPanelSVG,
      flipText: "Connect3 helps you find and connect with like-minded users.",
    },
    {
      title: "Events",
      svg: usersPanelSVG,
      flipText:
        "Connect3 enables you to explore and participate in events happening around you.",
    },
  ];

  return (
    <div className="w-full px-4 md:px-8">
      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto">
        {cards.map((card) => (
          <HeroPanel
            key={card.title}
            title={card.title}
            flipText={card.flipText}
          >
            {/* SVG fills entire card background */}
            <div className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full">
              {card.svg}
            </div>
          </HeroPanel>
        ))}
      </div>

      {/* Mobile: Horizontal scroll gallery */}
      <div
        ref={scrollRef}
        className="flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
      >
        {cards.map((card) => (
          <HeroPanel
            key={card.title}
            title={card.title}
            flipText={card.flipText}
            className="flex-shrink-0 w-64 h-64 snap-center"
          >
            {/* SVG fills entire card background */}
            <div className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full">
              {card.svg}
            </div>
          </HeroPanel>
        ))}
      </div>

      {/* Mobile scroll indicators */}
      <div className="flex md:hidden justify-center gap-2 mt-2">
        {cards.map((card, index) => (
          <div key={index} className="w-2 h-2 rounded-full bg-muted/30" />
        ))}
      </div>
    </div>
  );
}
