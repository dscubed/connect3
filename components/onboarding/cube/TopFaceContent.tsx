import { motion } from "framer-motion";

type TopFaceContentProps = {
  isHovered: boolean;
};

const TopFaceContent = ({ isHovered }: TopFaceContentProps) => (
  <>
    {/* <FloatingParticles show={isHovered || isDragging} /> */}
    {isHovered && (
      <div className="absolute inset-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 rounded-sm"
            style={{
              left: `${15 + i * 12}%`,
              top: "30%",
              width: "3px",
              height: "40%",
            }}
            animate={{
              scaleY: [0.5, 1, 0.7, 1],
              opacity: [0.3, 0.8, 0.4, 0.8],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    )}
  </>
);

export default TopFaceContent;
