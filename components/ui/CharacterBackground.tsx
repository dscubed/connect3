"use client";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Character, CharacterColor, EyeExpression} from "../characters";
import { useWindowSize } from "@/hooks/useWindowSize";
import {
  useBreakpointLargeXX,
  useBreakpointLargeX,
  useBreakpointLarge,
  useBreakpointMedium,
} from "@/hooks/useMediaQuery";

const SIZE = 80;
const PADDING = 3;
const COLOURS = ["purple", "green", "yellow", "blue", "orange", "red"] as const;
const EXPRESSIONS = ["cheeky", "closed", "open", "wink"] as const;

interface CharacterSpriteProps {
  offsetTop: number;
  offsetLeft: number;
  colour: CharacterColor;
  expression: EyeExpression;
}

function CharacterSprite({
  offsetTop,
  offsetLeft,
  colour,
  expression,
}: CharacterSpriteProps) {
  return (
    <span
      style={{
        position: "absolute",
        top: `${offsetTop}%`,
        left: `${offsetLeft}%`,
      }}
    >
      <Character color={colour} size={SIZE} expression={expression} grayscale={true} />
    </span>
  );
}

export function CharacterBackground() {
  const { width, height } = useWindowSize();
  const isLargeXX = useBreakpointLargeXX();
  const isLargeX = useBreakpointLargeX();
  const isLarge = useBreakpointLarge();
  const isMedium = useBreakpointMedium();

  const { characterCount, charactersPerRow, spacing } = useMemo(() => {
    if (!width || !height) {
      return { characterCount: 0, charactersPerRow: 0, spacing: 10 };
    }

    let charactersPerRow = 4;
    let spacing = 25;

    if (isLargeXX) {
      charactersPerRow = 7;
      spacing = 14;
    } else if (isLargeX) {
      charactersPerRow = 10;
      spacing = 15;
    } else if (isLarge) {
      charactersPerRow = 10;
      spacing = 17;
    } else if (isMedium) {
      charactersPerRow = 7;
      spacing = 17;
    }

    const rowCount = 10;
    const characterCount = charactersPerRow * rowCount;
    return { characterCount, charactersPerRow, spacing };
  }, [width, height, isLargeXX, isLargeX, isLarge, isMedium]);

  // Populate background with characters
  const characterData = useMemo(() => {
    const buffer = [];
    for (let i = 0; i < characterCount; i++) {
      const row = Math.floor(i / charactersPerRow);
      const col = i % charactersPerRow;
      const invertedCol = charactersPerRow - 1 - col;

      const diagonalShift = (charactersPerRow - 1) * spacing * 0.5;
      const offsetTop =
        -10 + PADDING - diagonalShift / 2 + row * spacing + invertedCol * (spacing * 0.5);
      let offsetLeft = PADDING + invertedCol * spacing;

      if (row % 2 === 0) {
        offsetLeft += 6;
      }

      const colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];
      const expression = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)];
      buffer.push({ offsetTop, offsetLeft, colour, expression });
    }
    return buffer;
  }, [characterCount, charactersPerRow, spacing]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {characterData.map((character, i) => (
        <CharacterSprite
          key={i}
          offsetTop={character.offsetTop}
          offsetLeft={character.offsetLeft}
          colour={character.colour}
          expression={character.expression}
        />
      ))}
    </div>
  );
}