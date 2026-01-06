'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CubeFace } from './CubeFace';
import FrontFaceContent from './FrontFaceContent';
import EatingParticles from './EatingParticles';
import TopFaceContent from './TopFaceContent';
import FloatingParticles from './FloatingParticles';
import { getFaceBorder, getFaceBg, getCubeScale, CUBE_CONFIG } from './utils/cubeUtils';

interface CubeContainerProps {
  files: File[];
  isDragging: boolean;
  isHovered: boolean;
  isEating: boolean;
  isDeleting: boolean;
  cubeRotate: { x: number; y: number; z: number };
  cube: { x: number; y: number; z: number };
  contentColor: string;
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
  files,
  isDragging,
  isHovered,
  isEating,
  isDeleting,
  cubeRotate,
  cube,
  contentColor,
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

  return (
    <motion.div
      className="relative w-48 h-48"
      style={{ perspective: "800px" }}
      animate={{
        scale: files.length > 0 ? 0.9 : 1
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
              ? "border-white/60 bg-white/10"
              : `${getFaceBorder(files.length, "front")} ${getFaceBg(files.length)}`
          } backdrop-blur-md flex items-center justify-center`}
          cubePosition={{ x: cube.x, y: cube.y, z: cube.z + cubeHalf }}
          cubeRotation={{ x: 0, y: 0, z: 0 }}
        >
          <FrontFaceContent
            files={files}
            isEating={isEating}
            contentColor={contentColor}
          />
          <EatingParticles isEating={isEating} />
        </CubeFace>

        {/* Back Face */}
        <CubeFace
          className={`${getFaceBorder(files.length, "back")} ${getFaceBg(files.length)} flex items-center justify-center`}
          cubePosition={{ x: cube.x, y: cube.y, z: cube.z - cubeHalf }}
          cubeRotation={{ x: 0, y: 180, z: 0 }}
        />

        {/* Right Face */}
        <CubeFace
          className={`${getFaceBorder(files.length, "right")} ${getFaceBg(files.length)}`}
          cubePosition={{ x: cube.x + cubeHalf, y: cube.y, z: cube.z }}
          cubeRotation={{ x: 0, y: 90, z: 90 }}
        />

        {/* Left Face */}
        <CubeFace
          className={`${getFaceBorder(files.length, "left")} ${getFaceBg(files.length)}`}
          cubePosition={{ x: cube.x - cubeHalf, y: cube.y, z: cube.z }}
          cubeRotation={{ x: 0, y: -90, z: 90 }}
        />

        {/* Top Face */}
        <CubeFace
          className={`${getFaceBorder(files.length, "top")} ${getFaceBg(files.length)} overflow-hidden origin-bottom`}
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
          className={`${getFaceBorder(files.length, "bottom")} ${getFaceBg(files.length)} overflow-hidden`}
          cubePosition={{ x: cube.x, y: cube.y + cubeHalf, z: cube.z }}
          cubeRotation={{ x: -90, y: 0, z: 0 }}
        />
      </motion.div>

      <FloatingParticles isDragging={isDragging} isHovered={isHovered} />
    </motion.div>
  );
};
