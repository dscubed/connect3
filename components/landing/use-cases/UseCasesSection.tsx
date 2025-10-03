import { useState } from "react";
import { QueryCardsGrid } from "./QueryCardsGrid";
import { DemoSection } from "./DemoSection";
import { demoUseCases } from "./sample-data/DemoUseCases";
import { DemoQuery } from "./types";

export function UseCasesSection() {
  // Use Cases Section
  const [selectedUseCase, setSelectedUseCase] = useState(demoUseCases[0].id);
  const [selectedQuery, setSelectedQuery] = useState<DemoQuery | null>(null);
  const selectedSection = demoUseCases.find(
    (section) => section.id === selectedUseCase
  );

  return (
    <div
      id="use-cases"
      className="w-full flex flex-col items-center justify-center py-12 md:py-16"
    >
      <section className="w-full max-w-6xl mx-auto px-4 md:px-8">
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-12 text-center">
          Discover Your Community
        </h3>
        {/* Use Case Tabs */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-12">
          {demoUseCases.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedUseCase(section.id)}
              className={`px-5 md:px-6 py-2.5 md:py-3 rounded-full font-semibold transition-all border text-sm md:text-base
                    ${
                      selectedUseCase === section.id
                        ? "bg-white/15 text-white border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        : "bg-black/40 text-white/60 border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20"
                    }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        {/* Query Cards*/}
        <QueryCardsGrid
          queries={selectedSection?.queries || []}
          selectedUseCase={selectedUseCase}
          onQueryClick={setSelectedQuery}
        />
        {/* Separator Line */}
        <div className="w-full border-t border-white/20 my-2 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />

        {/* Demo Section */}
        <DemoSection selectedQuery={selectedQuery} />
      </section>
    </div>
  );
}
