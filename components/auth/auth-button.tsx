// components/auth/auth-button.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "./logout-button";
import { useAuthStore } from "@/stores/authStore";

export function AuthButton() {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/profile" className="flex-shrink-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-white/40 transition-all hover:scale-105">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={`${profile.first_name || "User"}'s avatar`}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {profile?.first_name?.[0] || "User"}
              </div>
            )}
          </div>
        </Link>
        <span className="text-base font-medium">
          Hey, {profile?.first_name || user.email}!
        </span>
      </div>
      <div>
        <LogoutButton />
      </div>
    </div>
  ) : (
    <div>
      <div className="text-white/60 text-sm leading-relaxed">
        welcome to{" "}
        <span className="text-white font-semibold">
          connect<sup className="pl-0.5">3</sup>
        </span>
        , a place to find the people your ideas need. powered by nlp discovery.
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          href="/auth/sign-up"
          className="px-4 py-2 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
        >
          sign up
        </Link>
        <Link
          href="/auth/login"
          className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/5 transition-all hover:scale-105"
        >
          log in
        </Link>
      </div>
    </div>
  );
}
