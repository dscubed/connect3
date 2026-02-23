"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { HeroPanel } from "./HeroPanel";
import { clubsPanelSVG, eventsPanelSVGs, usersPanelSVG } from "./PanelSVGs";

export function HeroPanels() {
  const cards = [
    {
      heading: "Events",
      svg: eventsPanelSVGs,
      description:
        "Find all campus events in one feed and know exactly what is happening each week.",
      gradientRgb: [255, 218, 228] as [number, number, number], // light pink
      illustrationClassName: "[&>svg]:-translate-y-[6%] [&>svg]:-translate-x-[1.5%]", // shift up and left to center
    },
    {
      heading: "Clubs",
      svg: clubsPanelSVG,
      description:
        "Discover clubs that match your interests and explore what they offer in one place.",
      gradientRgb: [230, 215, 245] as [number, number, number], // light purple
      illustrationClassName: "[&>svg]:-translate-y-[4%]", // shift up to center
    },
    {
      heading: "Networking",
      svg: usersPanelSVG,
      description:
        "Connect with like-minded students, see who is going to events, and build your circle on campus.",
      gradientRgb: [218, 232, 255] as [number, number, number], // light blue
    },
  ];

  return (
    <div className="w-full px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
        {cards.map((card, i) => (
          <HeroPanel
            key={i}
            heading={card.heading}
            description={card.description}
            gradientRgb={card.gradientRgb}
            className="max-w-md md:max-w-none mx-auto"
          >
            <div
              className={cn(
                "w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full",
                (card as { illustrationClassName?: string }).illustrationClassName
              )}
            >
              {card.svg}
            </div>
          </HeroPanel>
        ))}
      </div>
    </div>
  );
}
