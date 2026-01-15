import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FastAverageColor } from "fast-average-color";
import { Club } from "@/types/clubs/club";

export function ClubListCard({
  club,
  isSelected,
  onClick,
}: {
  club: Club;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [bgColor, setBgColor] = useState<string | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (club.avatar_url && imgRef.current) {
      const fac = new FastAverageColor();
      fac
        .getColorAsync(imgRef.current)
        .then((color) => {
          // Lighten the color by blending with white (e.g., 70% white)
          const lighten = (c: number) => Math.round(c + (255 - c) * 0.7);
          const [r, g, b = 255] = color.value; // alpha defaults to 255 if not present
          const lr = lighten(r),
            lg = lighten(g),
            lb = lighten(b);

          setBgColor(`rgb(${lr}, ${lg}, ${lb})`);
        })
        .catch(() => setBgColor(undefined));
    }
  }, [club.avatar_url, club.first_name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl sm:rounded-2xl border transition-all duration-300 ${
        isSelected
          ? "bg-primary border-white/20 shadow-xl shadow-black/10"
          : "bg-secondary border-white/20 hover:bg-primary/80 hover:shadow-lg hover:shadow-black/5"
      }`}
    >
      <div
        className={`p-3 sm:p-5 flex items-start gap-3 sm:gap-4 ${
          isSelected ? "text-primary-foreground" : "text-secondary-foreground"
        }`}
      >
        {/* Logo */}
        <div
          className={`rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0 border ${
            isSelected ? "border-white" : "border-white"
          }`}
          style={{
            background: club.avatar_url && bgColor ? bgColor : undefined,
          }}
        >
          <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center">
            <Image
              ref={imgRef}
              src={club.avatar_url || "/placeholder.png"}
              alt={`${club.first_name} logo`}
              width={48}
              height={48}
              className="w-full h-full object-cover drop-shadow-md"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm sm:text-base mb-1 sm:mb-1.5 truncate ${
              isSelected
                ? "text-primary-foreground"
                : "text-secondary-foreground"
            }`}
          >
            {club.first_name}
          </h3>
          <p
            className={`text-opacity-50 text-xs sm:text-sm line-clamp-2 leading-relaxed ${
              isSelected
                ? "text-primary-foreground/50"
                : "text-secondary-foreground/50"
            }`}
          >
            {club.university ?? "No university"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
