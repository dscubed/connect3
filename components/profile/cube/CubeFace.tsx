import { motion } from "framer-motion";
import React from "react";

export type CubeFaceProps = {
  cubePosition: { x: number; y: number; z: number };
  cubeRotation?: { x?: number; y?: number; z?: number };
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
};

export const CubeFace = ({
  cubePosition,
  cubeRotation = {},
  className = "",
  children,
  ...rest
}: CubeFaceProps) => {
  const { x, y, z } = cubePosition;
  const { x: rotateX = 0, y: rotateY = 0, z: rotateZ = 0 } = cubeRotation;
  return (
    <motion.div
      className={`absolute w-48 h-48 rounded-md border transition-all duration-300 
        ${className} backdrop-blur-sm
      `}
      animate={{ x, y, z, rotateX, rotateY, rotateZ }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default CubeFace;
