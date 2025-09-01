import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

const FloatingParticles = ({ isHovered, isDragging }: { isHovered: boolean; isDragging: boolean }) => (
  <AnimatePresence>
    {(isHovered || isDragging) && (
      <div className="absolute -inset-8 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: `${20 + (i % 4) * 20}%`,
              top: `${20 + Math.floor(i / 4) * 20}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              y: [0, -5, 0],
              x: [0, (i % 2 ? 1 : -1) * 8, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.2,
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        ))}
      </div>
    )}
  </AnimatePresence>
);

export default FloatingParticles;