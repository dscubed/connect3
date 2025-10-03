"use client";
import Image from "next/image";

interface UserAvatarProps {
  avatarUrl?: string;
  fullName: string;
  size?: "sm" | "md" | "lg";
}

export default function UserAvatar({
  avatarUrl,
  fullName,
  size = "sm",
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <>
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border border-white/20`}
      >
        <Image
          src={avatarUrl || "/placeholder.png"}
          alt={`${fullName}'s avatar`}
          fill
          className="object-cover"
          sizes={size === "sm" ? "32px" : size === "md" ? "48px" : "64px"}
        />
      </div>
    </>
  );
}
