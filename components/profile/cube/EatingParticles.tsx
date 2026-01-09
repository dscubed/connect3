import { motion, AnimatePresence } from "framer-motion";

type EatingParticlesProps = {
  isEating: boolean;
};

const EatingParticles = ({ isEating }: EatingParticlesProps) => (
  <AnimatePresence>
    {isEating && (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/60 rounded-full"
            style={{
              left: `${30 + (i % 4) * 15}%`,
              top: `${30 + Math.floor(i / 4) * 15}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [0, (i % 2 ? 1 : -1) * 20],
              y: [0, -10],
            }}
            transition={{
              duration: 0.6,
              delay: i * 0.05,
            }}
          />
        ))}
      </div>
    )}
  </AnimatePresence>
);

export default EatingParticles;
