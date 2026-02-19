"use client";

import React from "react";
import { HeroPanel } from "./HeroPanel";
import { clubsPanelSVG, eventsPanelSVGs, usersPanelSVG } from "./PanelSVGs";

export function HeroPanels() {
  const cards = [
    {
      heading: "Events",
      svg: eventsPanelSVGs,
      description:
        "Find all campus events in one feed and know exactly what is happening each week.",
    },
    {
      heading: "Clubs",
      svg: clubsPanelSVG,
      description:
        "Discover clubs that match your interests and explore what they offer in one place.",
    },
    {
      heading: "Networking",
      svg: usersPanelSVG,
      description:
        "Connect with like-minded students, see who is going to events, and build your circle on campus.",
    },
  ];

  return (
    <div className="w-full px-4 md:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 max-w-4xl mx-auto">
        {cards.map((card, i) => (
          <HeroPanel key={i} heading={card.heading} description={card.description}>
            <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full">
              {card.svg}
            </div>
          </HeroPanel>
        ))}
      </div>
    </div>
  );
}
