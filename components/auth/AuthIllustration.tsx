"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Character } from "@/components/characters";
import type { CharacterColor, EyeExpression } from "@/components/characters";

import PurpleStarSrc from "@/components/stars/purple.svg";
import PinkStarSrc from "@/components/stars/pink.svg";

type Pos = number | string;
type Size = number | string;

type CommonItem = {
  id: string;
  x: Pos;
  y: Pos;
  size: Size;
  rotate?: number;
  zIndex?: number;
  className?: string;
  flipX?: boolean;
  flipY?: boolean;
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
  width?: Size;   // ✅ number OR css string
  height?: Size;  // ✅ number OR css string
  items: IllustrationItem[];
  className?: string;
}

const toCss = (v: Pos) => (typeof v === "number" ? `${v}px` : v);
const toCssSize = (v: Size) => (typeof v === "number" ? `${v}px` : v);

export function AuthIllustration({
  width = 380,
  height = 360,
  items,
  className,
}: AuthIllustrationProps) {
  return (
    <div
      className={cn("relative overflow-visible", className)}
      style={{ width: toCssSize(width), height: toCssSize(height) }}
      aria-hidden="true"
    >
      {items.map((it) => {
        const sx = it.flipX ? -1 : 1;
        const sy = it.flipY ? -1 : 1;

        const style: React.CSSProperties = {
          position: "absolute",
          left: toCss(it.x),
          top: toCss(it.y),
          width: toCssSize(it.size),
          height: toCssSize(it.size),
          zIndex: it.zIndex ?? 1,
          transformOrigin: "center",
          transform: `scale(${sx}, ${sy}) rotate(${it.rotate ?? 0}deg)`,
        };

        if (it.type === "character") {
          return (
            <div key={it.id} style={style} className={it.className}>
              <Character
                color={it.color}
                expression={it.expression ?? "open"}
                // wrapper controls sizing; this is only fallback
                size={typeof it.size === "number" ? it.size : 48}
                className="w-full h-auto drop-shadow-md"
              />
            </div>
          );
        }

        const src = it.variant === "purple" ? PurpleStarSrc : PinkStarSrc;

        return (
          <div key={it.id} style={style} className={it.className}>
            <Image src={src} alt="" fill className="object-contain drop-shadow-sm" />
          </div>
        );
      })}
    </div>
  );
}


/* ✅ Preset for SIGN UP (taller form) */
export const signupIllustrationPreset: IllustrationItem[] = [
  // characters
  { id: "orange", type: "character", color: "orange", expression: "closed", x: "60%", y: "5%", size: "clamp(68px, 22%, 95px)", rotate: 8, zIndex: 3 },
  { id: "blue", type: "character", color: "blue", expression: "wink", x: "20%", y: "40%", size: "clamp(68px, 22%, 95px)", rotate: -6, zIndex: 2, flipX: true },
  { id: "purple", type: "character", color: "purple", expression: "open", x: "90%", y: "45%", size: "clamp(72px, 24%, 105px)", rotate: 6, zIndex: 4 },
  { id: "red", type: "character", color: "red", expression: "closed", x: "0%", y: "95%", size: "clamp(90px, 28%, 120px)", rotate: -5, zIndex: 2, flipX: true },
  { id: "yellow", type: "character", color: "yellow", expression: "cheeky", x: "60%", y: "70%", size: "clamp(60px, 20%, 88px)", rotate: 12, zIndex: 3 },
  { id: "green", type: "character", color: "green", expression: "open", x: "55%", y: "90%", size: "clamp(60px, 20%, 88px)", rotate: 30, zIndex: 2, flipX: true },

  // stars
  { id: "star1", type: "star", variant: "pink", x: "95%", y: "25%", size: "clamp(18px, 6%, 30px)", rotate: 0 },
  { id: "star2", type: "star", variant: "purple", x: "70%", y: "45%", size: "clamp(14px, 5%, 22px)", rotate: -6 },
  { id: "star3", type: "star", variant: "pink", x: "30%", y: "75%", size: "clamp(18px, 6%, 30px)", rotate: -40 },
  { id: "star4", type: "star", variant: "purple", x: "88%", y: "75%", size: "clamp(18px, 6%, 30px)", rotate: 0 },
  { id: "star5", type: "star", variant: "purple", x: "10%", y: "90%", size: "clamp(16px, 5%, 26px)", rotate: -40 },
];

/* ✅ Preset for LOGIN (shorter form, shift cluster slightly up) */
export const loginIllustrationPreset: IllustrationItem[] = [
  { id: "orange", type: "character", color: "orange", expression: "closed", x: 265, y: 6, size: 92, rotate: 8, zIndex: 3 },
  { id: "blue", type: "character", color: "blue", expression: "wink", x: 160, y: 75, size: 84, rotate: -6, zIndex: 2, flipX: true },
  { id: "purple", type: "character", color: "purple", expression: "open", x: 275, y: 102, size: 104, rotate: 6, zIndex: 4 },
  { id: "red", type: "character", color: "red", expression: "closed", x: 190, y: 188, size: 92, rotate: -5, zIndex: 2 },
  { id: "yellow", type: "character", color: "yellow", expression: "cheeky", x: 255, y: 202, size: 64, rotate: 12, zIndex: 3 },
  { id: "green", type: "character", color: "green", expression: "open", x: 235, y: 268, size: 64, rotate: -10, zIndex: 2 },

  { id: "star1", type: "star", variant: "pink", x: 330, y: 64, size: 28, rotate: 8 },
  { id: "star2", type: "star", variant: "purple", x: 285, y: 98, size: 22, rotate: -6 },
  { id: "star3", type: "star", variant: "pink", x: 215, y: 142, size: 28, rotate: -10 },
  { id: "star4", type: "star", variant: "purple", x: 270, y: 300, size: 24, rotate: 12 },
  { id: "star5", type: "star", variant: "purple", x: 185, y: 295, size: 28, rotate: -8 },
  { id: "star6", type: "star", variant: "pink", x: 318, y: 190, size: 24, rotate: 10 },
];

/** Default layout */
export const authIllustrationPreset: IllustrationItem[] = [
  // characters
  { id: "orange", type: "character", color: "orange", expression: "closed", x: "60%", y: "-50%", size: 100, rotate: 8, zIndex: 3 },
  { id: "blue", type: "character", color: "blue", expression: "wink", x: "20%", y: "-10%", size: 100, rotate: -6, zIndex: 2, flipX: true },
  { id: "purple", type: "character", color: "purple", expression: "open", x: "95%", y: "0%", size: 100, rotate: 6, zIndex: 4 },
  { id: "red", type: "character", color: "red", expression: "closed", x: "0%", y: "50%", size: 150, rotate: -5, zIndex: 2, flipX: true },
  { id: "yellow", type: "character", color: "yellow", expression: "cheeky", x: "60%", y: "25%", size: 100, rotate: 12, zIndex: 3 },
  { id: "green", type: "character", color: "green", expression: "open", x: "55%", y: "90%", size: 100, rotate: 30, zIndex: 2, flipX: true },

  // stars (purple + pink only)
  { id: "star1", type: "star", variant: "pink", x: "100%", y: "-30%", size: 40, rotate: 0, zIndex: 1 },
  { id: "star2", type: "star", variant: "purple", x: "70%", y: "0%", size: 25, rotate: -6, zIndex: 1 },
  { id: "star3", type: "star", variant: "pink", x: "30%", y: "30%", size: 40, rotate: -40, zIndex: 1 },
  { id: "star4", type: "star", variant: "purple", x: "90%", y: "70%", size: 40, rotate: 0, zIndex: 1 },
  { id: "star5", type: "star", variant: "purple", x: "10%", y: "100%", size: 30, rotate: -40, zIndex: 1 },
];
