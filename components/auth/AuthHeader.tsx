"use client";

import Link from "next/link";
import Logo from "@/components/logo/Logo";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  className?: string;
}

export function AuthHeader({ className }: AuthHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-center", className)}>
      <Link
        href="/"
        aria-label="Go to home"
        className="flex items-center gap-3 transition hover:opacity-90"
      >
        {/* Logo uses currentColor */}
        <Logo width={34} height={34} className="text-black" />
        <span className="text-xl font-semibold text-black">
          Connect3
        </span>
      </Link>
    </div>
  );
}
