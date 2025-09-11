import { motion } from "framer-motion";

export const CubeLoader = ({ size = 12 }: { size?: number }) => (
  <div className="flex items-center justify-center py-12">
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={{ rotateX: 360, rotateY: 360 }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      <motion.div
        className="absolute inset-0 border-2 border-white/30 rounded-lg"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-1 border border-white/50 rounded-md"
        animate={{
          rotateZ: 360,
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute inset-2 bg-white/20 rounded-sm"
        animate={{
          scale: [0.5, 1, 0.5],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  </div>
);
