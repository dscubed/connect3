import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";

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
};

interface CoverImageProps {
  editingProfile: boolean;
}

export default function CoverImage({
  editingProfile = false,
}: CoverImageProps) {
  const [selectedColor, setSelectedColor] =
    useState<keyof typeof COVER_IMAGES>("Purple");

  return (
    <motion.div
      className="relative min-h-48 h-48 w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Image */}
      <Image
        src={COVER_IMAGES[selectedColor].source}
        alt="Cover Image"
        fill
        className="object-cover object-center"
        priority
        unoptimized
        quality={1280}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/40" />

      {/* Additional edge blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/50" />

      {/* Edit Cover Button */}
      {editingProfile && (
        <div className="absolute bottom-12 right-2 md:bottom-6 md:right-12 items-center justify-center flex animate-fade-in">
          {Object.keys(COVER_IMAGES).map((color) => {
            const selected = color === selectedColor;

            return (
              <Button
                key={color}
                variant="outline"
                className={`mx-1 p-2 rounded-full h-8 w-8${
                  selected ? " ring-2 ring-primary" : ""
                }`}
                style={{
                  backgroundColor:
                    COVER_IMAGES[color as keyof typeof COVER_IMAGES].color,
                }}
                onClick={() =>
                  setSelectedColor(color as keyof typeof COVER_IMAGES)
                }
              >
                {selected && <Check className="h-4 w-4" />}
              </Button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
