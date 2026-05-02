"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { HeroSearchModal } from "./HeroSearchModal";

interface HeroActionsProps {
  className?: string;
}

export function HeroActions({ className }: HeroActionsProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className={className}>
        <button
          onClick={() => router.push("/auth/sign-up")}
          className="px-6 py-2.5 bg-foreground/80 hover:bg-foreground text-white text-sm font-semibold rounded-2xl shadow-md shadow-violet-200/60 transition-colors"
        >
          Sign Up
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/80 hover:bg-white border border-white/60 text-sm font-semibold text-secondary-foreground rounded-2xl shadow-md backdrop-blur-sm transition-colors"
        >
          <Search className="w-4 h-4 text-foreground/80" />
          Search
        </button>
      </div>

      {searchOpen && <HeroSearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
