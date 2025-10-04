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
      className="w-full flex flex-col items-center justify-center py-2 px-4 relative"
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="relative z-10 w-full">
      <section className="w-full max-w-5xl mx-auto text-center">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-center bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent px-4">
          Discover What's Possible
        </h3>
        <p className="text-white/60 text-xs md:text-sm text-center mb-6 max-w-2xl mx-auto px-4">
          Real queries from UniMelb students, powered by AI to connect you with the right people
        </p>
        {/* Use Case Tabs */}
        <div className="flex flex-row justify-center gap-2 mb-6 px-4">
          {demoUseCases.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedUseCase(section.id)}
              className={`px-4 py-1.5 rounded-full font-medium transition-all border text-xs whitespace-nowrap
                    ${
                      selectedUseCase === section.id
                        ? "bg-white/15 text-white border-white/30 shadow-lg"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
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

        {/* Demo Section */}
        <DemoSection selectedQuery={selectedQuery} />
      </section>
      </div>
    </div>
  );
}
