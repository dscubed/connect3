import { motion } from "framer-motion";
import { DemoQuery } from "./types";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      default: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
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
  return (
    <div className="relative w-full">
      {/* Left blur fade */}
      <div className="absolute left-0 top-0 z-10 w-6 md:w-16 h-full bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />

      {/* Right blur fade */}
      <div className="absolute right-0 top-0 z-10 w-6 md:w-16 h-full bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none" />

      <div
        className="w-full overflow-x-auto pb-4 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        ref={(el) => {
          if (el) {
            const container = el;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            const centerPosition = (scrollWidth - clientWidth) / 2;
            container.scrollLeft = centerPosition;
          }
        }}
      >
        <motion.div
          className="flex gap-4 md:gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={selectedUseCase} // Force re-animation when tab changes
        >
          {/* Empty spacer card - LEFT */}
          <div className="flex-shrink-0 w-8"></div>

          {queries.map((queryObj, idx) => (
            <motion.div
              key={`${selectedUseCase}-${idx}`}
              variants={itemVariants}
              onClick={() => onQueryClick?.(queryObj)}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 cursor-pointer group flex-shrink-0 w-80 md:w-96"
            >
              <p className="text-white/90 text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                {`"${queryObj.query}"`}
              </p>
            </motion.div>
          ))}

          {/* Empty spacer card - RIGHT */}
          <div className="flex-shrink-0 w-8"></div>
        </motion.div>
      </div>
    </div>
  );
}
