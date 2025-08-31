// components/auth/auth-button.tsx
"use client";

import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { useAuthStore } from "@/stores/authStore";

export function AuthButton() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <div>
      <div className="flex flex-col gap-4">
        Hey, {user.email}!
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
