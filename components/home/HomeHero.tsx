"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { HomeHeroBackground } from "./HomeHeroBackground";
import { HomeHeroStickers } from "./HomeHeroStickers";
import { HomeHeroFloatingCard } from "./HomeHeroFloatingCard";
import { HomeSearchBar } from "./HomeSearchBar";
import { cn } from "@/lib/utils";

function LogoBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-6 w-6 overflow-hidden rounded-full bg-white border border-white/70 shadow-sm",
        className,
      )}
    >
      <Image src="/characters/blue.png" alt="" fill className="object-contain" />
    </div>
  );
}

function EventBadge() {
  return (
    <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/70 bg-white/90 shadow-sm">
      <Image
        src="/hero/character-gathering.png"
        alt=""
        fill
        className="object-contain"
      />
    </div>
  );
}


export function HomeHero() {
  const searchParams = useSearchParams();
  const debugOverlay = searchParams?.get("debug") === "overlay";
  const isDev = process.env.NODE_ENV !== "production";
  const canShowOverlay = isDev || debugOverlay;
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [differenceMode, setDifferenceMode] = useState(false);

  useEffect(() => {
    if (debugOverlay) setOverlayVisible(true);
  }, [debugOverlay]);

  return (
    <section className="w-full">
      <div className="relative w-full aspect-[1271/670]">
        <div className="absolute inset-0 overflow-hidden rounded-none shadow-[0_30px_70px_-45px_rgba(60,40,120,0.55)]">
          <HomeHeroBackground />
          <HomeHeroStickers />
          <div className="relative z-20 grid h-full grid-cols-1 items-center gap-[clamp(1.5rem,3.5vw,2.5rem)] p-[clamp(1.25rem,3.8vw,3.5rem)] md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-4 self-center md:-ml-8 md:-mt-2">
              <h1 className="font-fredoka text-[clamp(1.9rem,4.3vw,3.75rem)] font-semibold leading-[1.05] text-slate-800">
                IT TAKES <span className="home-hero-scribble">THREE</span>
                TO CONNECT
              </h1>
              <p className="text-[clamp(0.95rem,2vw,1.125rem)] text-slate-600">
                find events, clubs and students all-in-one
              </p>
              <HomeSearchBar className="max-w-xl" />
            </div>
          </div>
          {canShowOverlay && overlayVisible && (
            <div className="pointer-events-none absolute inset-0 z-30">
              <Image
                src="/hero/reference.png"
                alt=""
                fill
                className={cn(
                  "object-contain",
                  differenceMode && "mix-blend-difference",
                )}
                style={{
                  opacity: overlayOpacity,
                  filter: differenceMode
                    ? "grayscale(1) contrast(1.1)"
                    : "none",
                }}
              />
            </div>
          )}
        </div>
        {canShowOverlay && (
          <div className="absolute left-4 top-4 z-40 flex flex-col gap-2 rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-xs text-slate-700 shadow-[0_10px_24px_-16px_rgba(40,20,80,0.4)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold">Overlay</span>
              <button
                type="button"
                onClick={() => setOverlayVisible((prev) => !prev)}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
                  overlayVisible
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200 text-slate-700",
                )}
              >
                {overlayVisible ? "On" : "Off"}
              </button>
            </div>
            <label className="flex items-center gap-2 text-[11px]">
              Opacity
              <input
                type="range"
                min={10}
                max={100}
                value={Math.round(overlayOpacity * 100)}
                onChange={(event) =>
                  setOverlayOpacity(Number(event.target.value) / 100)
                }
                className="h-1 w-24 accent-slate-700"
              />
            </label>
            <button
              type="button"
              onClick={() => setDifferenceMode((prev) => !prev)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
                differenceMode
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 text-slate-700",
              )}
            >
              Difference tint
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
