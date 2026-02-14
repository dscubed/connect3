// components/characters/types.ts

export type CharacterColor = "purple" | "green" | "yellow" | "blue" | "orange" | "red";

export type EyeExpression = "open" | "closed" | "wink" | "cheeky";

export interface CharacterProps {
  size?: number;             // optional width/height
  className?: string;        // tailwind / custom classes
  color: CharacterColor;     // which character color
  expression: EyeExpression; // which eye expression
  grayscale?: boolean; // Whether to convert svg to grayscale and reduce opacity. Used for background component
}
