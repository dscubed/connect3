"use client";

import React from "react";
import { motion } from "framer-motion";
import { CubeFace } from "./CubeFace";
import FrontFaceContent from "./FrontFaceContent";
import EatingParticles from "./EatingParticles";
import TopFaceContent from "./TopFaceContent";
import FloatingParticles from "./FloatingParticles";
import { getFaceBg, getCubeScale, CUBE_CONFIG } from "./utils/cubeUtils";

interface CubeContainerProps {
  file: File | null;
  isDragging: boolean;
  isHovered: boolean;
  isEating: boolean;
  isDeleting: boolean;
  cubeRotate: { x: number; y: number; z: number };
  cube: { x: number; y: number; z: number };
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
}

export const CubeContainer: React.FC<CubeContainerProps> = ({
  file,
  isDragging,
  isHovered,
  isEating,
  isDeleting,
  cubeRotate,
  cube,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
}) => {
  const { SIZE: cubeSize, HALF: cubeHalf } = CUBE_CONFIG;
  const hasFile = !!file;

  return (
    <motion.div
      className="relative w-52 h-52"
      style={{ perspective: "800px" }}
      animate={{
        scale: hasFile ? 0.9 : 1,
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: isHovered ? -15 : cubeRotate.x,
          rotateY: isHovered ? 25 : cubeRotate.y,
          rotateZ: cubeRotate.z,
          scale: getCubeScale(isDragging, isHovered, isEating, isDeleting),
        }}
        transition={{
          duration: isEating || isDeleting ? 0.4 : 0.3,
          ease: "easeOut",
        }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Front Face */}
        <CubeFace
          className={`${
            isDragging
              ? "border-background/60 bg-background/20"
              : `${getFaceBg(hasFile)}`
          } backdrop-blur-md flex items-center justify-center`}
          cubePosition={{ x: cube.x, y: cube.y, z: cube.z + cubeHalf }}
          cubeRotation={{ x: 0, y: 0, z: 0 }}
        >
          <FrontFaceContent hasFile={hasFile} isEating={isEating} />
          <EatingParticles isEating={isEating} />
        </CubeFace>

        {/* Back Face */}
        <CubeFace
          className={`${getFaceBg(hasFile)} flex items-center justify-center`}
          cubePosition={{ x: cube.x, y: cube.y, z: cube.z - cubeHalf }}
          cubeRotation={{ x: 0, y: 180, z: 0 }}
        />

        {/* Right Face */}
        <CubeFace
          className={`${getFaceBg(hasFile)}`}
          cubePosition={{ x: cube.x + cubeHalf, y: cube.y, z: cube.z }}
          cubeRotation={{ x: 0, y: 90, z: 90 }}
        />

        {/* Left Face */}
        <CubeFace
          className={`${getFaceBg(hasFile)}`}
          cubePosition={{ x: cube.x - cubeHalf, y: cube.y, z: cube.z }}
          cubeRotation={{ x: 0, y: -90, z: 90 }}
        />

        {/* Top Face */}
        <CubeFace
          className={`${getFaceBg(hasFile)} overflow-hidden origin-bottom`}
          cubePosition={{
            x: cube.x,
            y: cube.y - cubeSize,
            z: cube.z - cubeHalf,
          }}
          cubeRotation={{ x: isHovered ? -60 : -90, y: 0, z: 0 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        >
          <TopFaceContent isHovered={isHovered} />
        </CubeFace>

        {/* Bottom Face */}
        <CubeFace
          className={`${getFaceBg(hasFile)} overflow-hidden`}
          cubePosition={{ x: cube.x, y: cube.y + cubeHalf, z: cube.z }}
          cubeRotation={{ x: -90, y: 0, z: 0 }}
        />
      </motion.div>

      <FloatingParticles isDragging={isDragging} isHovered={isHovered} />
    </motion.div>
  );
};
