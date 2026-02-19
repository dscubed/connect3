"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

const COVER_IMAGES = {
  Purple: {
    source: "/cover/cover-purple.png",
    color: "#D5A5FA",
  },
  Blue: {
    source: "/cover/cover-blue.png",
    color: "#A5C8FA",
  },
  Green: {
    source: "/cover/cover-green.png",
    color: "#A5FAC9",
  },
  Red: {
    source: "/cover/cover-red.png",
    color: "#FAA5A5",
  },
  Yellow: {
    source: "/cover/cover-yellow.png",
    color: "#FAEAA5",
  },
} as const;

const COVER_KEYS = Object.keys(COVER_IMAGES) as (keyof typeof COVER_IMAGES)[];

const COVER_RGB: Record<keyof typeof COVER_IMAGES, [number, number, number]> = {
  Purple: [0xd5, 0xa5, 0xfa],
  Blue: [0xa5, 0xc8, 0xfa],
  Green: [0xa5, 0xfa, 0xc9],
  Red: [0xfa, 0xa5, 0xa5],
  Yellow: [0xfa, 0xea, 0xa5],
};

function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
}

export function getCoverColorFromUserId(userId: string): keyof typeof COVER_IMAGES {
  const hash = userId
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const index = Math.abs(hash) % COVER_KEYS.length;
  return COVER_KEYS[index];
}

function getClosestCoverColor(r: number, g: number, b: number): keyof typeof COVER_IMAGES {
  let closest: keyof typeof COVER_IMAGES = "Purple";
  let minDist = Infinity;

  for (const key of COVER_KEYS) {
    const [cr, cg, cb] = COVER_RGB[key];
    const dist = colorDistance(r, g, b, cr, cg, cb);
    if (dist < minDist) {
      minDist = dist;
      closest = key;
    }
  }
  return closest;
}

interface CoverImageProps {
  userId: string;
  avatarUrl?: string | null;
}

export default function CoverImage({ userId, avatarUrl }: CoverImageProps) {
  const fallbackColor = getCoverColorFromUserId(userId);
  const [selectedColor, setSelectedColor] =
    useState<keyof typeof COVER_IMAGES>(fallbackColor);

  useEffect(() => {
    if (!avatarUrl?.trim()) {
      setSelectedColor(fallbackColor);
      return;
    }

    let cancelled = false;
    const fac = new FastAverageColor();

    fac
      .getColorAsync(avatarUrl, {
        algorithm: "dominant",
        crossOrigin: "anonymous",
      })
      .then((result) => {
        if (cancelled) return;
        const [r, g, b] = result.value;
        setSelectedColor(getClosestCoverColor(r, g, b));
      })
      .catch(() => {
        if (cancelled) return;
        setSelectedColor(fallbackColor);
      })
      .finally(() => {
        fac.destroy();
      });

    return () => {
      cancelled = true;
    };
  }, [avatarUrl, fallbackColor]);

  return (
    <motion.div
      className="relative min-h-48 h-48 w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Image
        src={COVER_IMAGES[selectedColor].source}
        alt="Cover Image"
        fill
        className="object-cover object-center rounded-xl opacity-65"
        priority
        unoptimized
        quality={1280}
      />
    </motion.div>
  );
}
