"use client";
import { useState } from "react";
import Image from "next/image";
import Avvvatars from "avvvatars-react";

interface UserAvatarProps {
  avatarUrl?: string | null;
  fullName: string;
  /** Required for generated avatar fallback when no image. Falls back to "anonymous" if omitted. */
  userId?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: 32,
  md: 48,
  lg: 64,
};

export default function UserAvatar({
  avatarUrl,
  fullName,
  userId = "",
  size = "sm",
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const pixelSize = SIZE_MAP[size];
  const hasValidAvatar = avatarUrl && avatarUrl.trim().length > 0;
  const showGeneratedAvatar = !hasValidAvatar || imageError;
  const seed = userId || "anonymous";

  if (showGeneratedAvatar) {
    return (
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border border-white/20 flex-shrink-0`}
      >
        <Avvvatars
          value={seed}
          displayValue={fullName}
          size={pixelSize}
          radius={pixelSize}
          border={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border border-white/20 flex-shrink-0`}
    >
      <Image
        src={avatarUrl!}
        alt={`${fullName}'s avatar`}
        fill
        className="object-cover"
        sizes={size === "sm" ? "32px" : size === "md" ? "48px" : "64px"}
        onError={() => setImageError(true)}
      />
    </div>
  );
}
