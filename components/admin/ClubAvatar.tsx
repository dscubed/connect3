"use client";

import Image from "next/image";
import { useState } from "react";

interface ClubAvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: number;
}

export default function ClubAvatar({
  name,
  avatarUrl,
  size = 40,
}: ClubAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = name.slice(0, 2).toUpperCase();

  if (avatarUrl && !imgError) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-purple-100"
      style={{ width: size, height: size }}
    >
      <span className="text-xs font-semibold text-purple-600">{initials}</span>
    </div>
  );
}
