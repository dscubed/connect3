"use client";
import { useState } from "react";
import Image from "next/image";
import Avvvatars from "avvvatars-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl?: string | null;
  fullName: string;
  /** Required for generated avatar fallback when no image. Falls back to "anonymous" if omitted. */
  userId?: string;
  size?: "sm" | "md" | "lg";
  /** When true, shows rounded square (like Twitter orgs); otherwise circular. */
  isOrganisation?: boolean;
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
  isOrganisation = false,
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
        className={cn(
          "relative flex-shrink-0 overflow-hidden border border-gray-200",
          sizeClasses[size],
          isOrganisation ? "rounded-[20%]" : "rounded-full"
        )}
      >
        <Avvvatars
          value={seed}
          displayValue={fullName}
          size={pixelSize}
          radius={isOrganisation ? Math.round(pixelSize * 0.1) : pixelSize}
          border={false}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex-shrink-0 overflow-hidden border border-gray-200",
        sizeClasses[size],
        isOrganisation ? "rounded-[20%]" : "rounded-full"
      )}
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
