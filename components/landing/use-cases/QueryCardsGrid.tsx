import { motion } from "framer-motion";
import { DemoQuery } from "./types";
import { useState } from "react";
import { ScrollableGallery } from "../ScrollableGallery";

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

interface QueryCardsGridProps {
  queries: DemoQuery[];
  selectedUseCase: string;
  onQueryClick?: (query: DemoQuery) => void;
}

export function QueryCardsGrid({
  queries,
  selectedUseCase,
  onQueryClick,
}: QueryCardsGridProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleCardClick = (queryObj: DemoQuery) => {
    if (!isDragging) {
      onQueryClick?.(queryObj);
    }
  };

  return (
    <ScrollableGallery
      autoCenter={true}
      centerKey={selectedUseCase}
      className="pb-4"
      blurWidth="md"
      gap="md"
      enableDrag={true}
    >
      {/* DON'T wrap in motion.div - animate each card individually */}
      {queries.map((queryObj, idx) => (
        <motion.div
          key={`${selectedUseCase}-${idx}`}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.4,
            delay: 0.2 + idx * 0.1,
            ease: "easeOut",
          }}
          onClick={() => handleCardClick(queryObj)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 cursor-pointer group flex-shrink-0 w-48 md:w-96 pointer-events-auto"
        >
          <p className="text-white/90 text-sm text-center md:text-base leading-relaxed group-hover:text-white transition-colors">
            {`"${queryObj.query}"`}
          </p>
        </motion.div>
      ))}
    </ScrollableGallery>
  );
}
