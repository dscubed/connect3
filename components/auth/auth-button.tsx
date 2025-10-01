// components/auth/auth-button.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "./logout-button";
import { useAuthStore } from "@/stores/authStore";

export function AuthButton() {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return <div className="text-xs text-white/60">Loading...</div>;
  }

  return user ? (
    <div className="flex items-center gap-2">
      <Link href="/profile" className="flex-shrink-0">
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/20 hover:ring-white/40 transition-all hover:scale-105">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={`${profile.first_name || "User"}'s avatar`}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
              {profile?.first_name?.[0] || "U"}
            </div>
          )}
        </div>
      </Link>
      <span className="text-sm font-medium text-white hidden sm:block">
        {profile?.first_name || "User"}
      </span>
      <div className="ml-2">
        <LogoutButton />
      </div>
    </div>
  ) : (
    <div className="flex gap-2">
      <Link
        href="/auth/sign-up"
        className="px-3 py-1.5 text-xs rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-md"
      >
        sign up
      </Link>
      <Link
        href="/auth/login"
        className="px-3 py-1.5 text-xs rounded-lg border border-white/20 hover:border-white/30 hover:bg-white/5 transition-all hover:scale-105 text-white"
      >
        log in
      </Link>
    </div>
  );
}
