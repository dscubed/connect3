"use client";

import React from "react";
import Image from "next/image";
import { emojiMap } from "./svgMap";
import type { CharacterProps } from "./types";

const Character: React.FC<CharacterProps> = ({
  size = 48,
  className = "",
  color,
  expression,
  grayscale = false,
}) => {
  const src = emojiMap[expression][color];

  return (
    <Image
      src={src}
      style={{
        filter: grayscale ? 'grayscale(100%)' : 'grayscale(0%)',
        opacity: grayscale ? 0.05 : 1.0,
      }}
      alt={`${expression} ${color} character`}
      width={size}
      height={size}
      className={className}
    />
  );
};

export default Character;
