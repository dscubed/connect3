"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Character } from "@/components/characters";
import type { CharacterColor, EyeExpression } from "@/components/characters";

// Import stars
import PurpleStarSrc from "@/components/stars/purple.svg";
import PinkStarSrc from "@/components/stars/pink.svg";

type Pos = number | string;

type CommonItem = {
  id: string;
  x: Pos; // left
  y: Pos; // top
  size: number; // px
  rotate?: number; // deg
  zIndex?: number;
  className?: string;

  // ✅ flip controls
  flipX?: boolean; // mirror horizontally
  flipY?: boolean; // mirror vertically
};

export type IllustrationItem =
  | (CommonItem & {
      type: "character";
      color: CharacterColor;
      expression?: EyeExpression;
    })
  | (CommonItem & {
      type: "star";
      variant: "purple" | "pink";
    });

interface AuthIllustrationProps {
  width?: number;
  height?: number;
  items: IllustrationItem[];
  className?: string;
}

const toCss = (v: Pos) => (typeof v === "number" ? `${v}px` : v);

export function AuthIllustration({
  width = 380,
  height = 360,
  items,
  className,
}: AuthIllustrationProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width, height }}
      aria-hidden="true"
    >
      {items.map((it) => {
        const sx = it.flipX ? -1 : 1;
        const sy = it.flipY ? -1 : 1;

        const style: React.CSSProperties = {
          position: "absolute",
          left: toCss(it.x),
          top: toCss(it.y),
          width: it.size,
          height: it.size,
          zIndex: it.zIndex ?? 1,

          // ✅ flip + rotate (order matters)
          transformOrigin: "center",
          transform: `scale(${sx}, ${sy}) rotate(${it.rotate ?? 0}deg)`,
        };

        // Character
        if (it.type === "character") {
          return (
            <div key={it.id} style={style} className={it.className}>
              <Character
                color={it.color}
                expression={it.expression ?? "open"}
                size={it.size}
                className="drop-shadow-md"
              />
            </div>
          );
        }

        // Star
        const src = it.variant === "purple" ? PurpleStarSrc : PinkStarSrc;

        return (
          <div key={it.id} style={style} className={it.className}>
            <Image
              src={src}
              alt=""
              width={it.size}
              height={it.size}
              className="drop-shadow-sm"
              priority={false}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Default layout */
export const authIllustrationPreset: IllustrationItem[] = [
  // characters
  { id: "orange", type: "character", color: "orange", expression: "closed", x: "50%", y: "-50%", size: 100, rotate: 8, zIndex: 3 },
  { id: "blue", type: "character", color: "blue", expression: "wink", x: "10%", y: "-10%", size: 100, rotate: -6, zIndex: 2, flipX: true },
  { id: "purple", type: "character", color: "purple", expression: "open", x: "85%", y: "0%", size: 100, rotate: 6, zIndex: 4 },
  { id: "red", type: "character", color: "red", expression: "closed", x: "-10%", y: "50%", size: 150, rotate: -5, zIndex: 2, flipX: true },
  { id: "yellow", type: "character", color: "yellow", expression: "cheeky", x: "50%", y: "25%", size: 100, rotate: 12, zIndex: 3 },
  { id: "green", type: "character", color: "green", expression: "open", x: "45%", y: "90%", size: 100, rotate: 30, zIndex: 2, flipX: true },

  // stars (purple + pink only)
  { id: "star1", type: "star", variant: "pink", x: "90%", y: "-30%", size: 40, rotate: 0, zIndex: 1 },
  { id: "star2", type: "star", variant: "purple", x: "60%", y: "0%", size: 25, rotate: -6, zIndex: 1 },
  { id: "star3", type: "star", variant: "pink", x: "20%", y: "30%", size: 40, rotate: -40, zIndex: 1 },
  { id: "star4", type: "star", variant: "purple", x: "80%", y: "70%", size: 40, rotate: 0, zIndex: 1 },
  { id: "star5", type: "star", variant: "purple", x: "0%", y: "100%", size: 30, rotate: -40, zIndex: 1 },
];
