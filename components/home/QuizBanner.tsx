"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

const STORAGE_KEY = "quiz-banner-dismissed";
const SHOW_AFTER_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function shouldShowBanner(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const dismissedAt = Number(raw);
    if (Number.isNaN(dismissedAt)) return true;
    return Date.now() - dismissedAt > SHOW_AFTER_MS;
  } catch {
    return true;
  }
}

export function QuizBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (shouldShowBanner()) setMounted(true);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setMounted(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-lg bg-purple-100 py-2 pl-3 pr-2 text-purple-600">
      <Link href="/quiz" className="flex flex-1 cursor-pointer items-center gap-2 font-medium leading-snug">
        <Sparkles className="h-5 w-5 shrink-0" />
        Take the Connect3 quiz to find out your student personality type.
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="shrink-0 rounded p-1 hover:bg-purple-200 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
