"use client";

import React from "react";
import Image from "next/image";
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
  return (
    <section className="w-full">
      <div className="relative w-full aspect-[1271/670]">
        <div className="absolute inset-0 overflow-hidden rounded-none shadow-[0_30px_70px_-45px_rgba(60,40,120,0.55)]">
          <HomeHeroBackground />
          <HomeHeroStickers />
          <div className="relative z-20 grid h-full grid-cols-1 items-center gap-[clamp(1.5rem,3.5vw,2.5rem)] px-[clamp(1.5rem,4.5vw,3.5rem)] py-[clamp(1.25rem,3.8vw,3.5rem)] md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-4 self-center lg:-ml-8 lg:-mt-2">
              <h1 className="font-fredoka text-[clamp(1.3rem,3.6vw,3.1rem)] font-semibold leading-[1.05] text-slate-800">
                IT TAKES <span className="home-hero-scribble">THREE</span>
                TO CONNECT
              </h1>
              <p className="text-[clamp(0.75rem,1.6vw,0.95rem)] text-slate-600">
                find events, clubs and students all-in-one
              </p>
              <HomeSearchBar className="max-w-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
