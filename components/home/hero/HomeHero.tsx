"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { HomeHeroBackground } from "./HomeHeroBackground";
import { HomeHeroStickers } from "./HomeHeroStickers";
import { HomeHeroFloatingCard } from "./HomeHeroFloatingCard";
import { PurplePath, BluePath, RedPath } from "./illustrations/HeroPaths";
import { SearchInput } from "../../search/SearchInput";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

function LogoBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-6 w-6 overflow-hidden rounded-lg bg-white border border-white/70 shadow-sm",
        className,
      )}
    >
      <Image src="/logo.png" alt="" fill className="object-contain" />
    </div>
  );
}

function EventBadge() {
  return (
    <div
      className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/70 shadow-sm"
      style={{ background: "radial-gradient(circle, #B8E5EE, #A778FF)" }}
    >
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
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative isolate w-full h-full min-h-[360px] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden shadow-[0_30px_70px_-45px_rgba(60,40,120,0.55)]">
        <HomeHeroBackground />

        {/* Text content — full width on mobile, left-capped on md+ */}
        <div className="relative z-[80] flex h-full flex-col justify-center px-4 md:px-6 lg:px-8 xl:px-12 py-5 md:py-8 lg:py-12 md:max-w-[60%]">
          <div className="flex flex-col gap-2 md:gap-3 lg:gap-4 text-center sm:text-start items-center sm:items-start">
            <h1 className="font-fredoka text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold leading-[1.05] text-slate-800">
              IT TAKES <span className="home-hero-scribble">THREE</span>{" "}
              <br></br> TO CONNECT
            </h1>
            <p className="text-sm sm:text-sm lg:text-base text-slate-600">
              find events, clubs and students all-in-one
            </p>
            <SearchInput
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
              onSubmit={handleSearch}
            />
          </div>
        </div>

        {/* Card groups — flex-col wrapper keeps illustration + card as one unit, no clipping */}
        <div className="absolute inset-0 z-[100] pointer-events-none">
          {/* Stickers sit above trails (-z-10) but below illustrations (z-10) and cards (z-[15]) */}
          <HomeHeroStickers />
          {/* ABC Club group: top-center mobile → slightly-right md → upper-right lg */}
          <div
            className={cn(
              "absolute flex flex-col pointer-events-none",
              "top-[1%] left-1/2 -translate-x-1/2 w-44",
              "md:translate-x-0 md:left-[42%] md:top-[2%] md:w-48",
              "lg:left-[56%] lg:top-[3%] lg:w-52 xl:w-56 2xl:w-60",
            )}
          >
            <div className="relative self-center w-[58%] aspect-square -mb-2 pointer-events-none">
              {/* translate(-6.24%, -96.54%) puts the path's M(35,393) start exactly at this div's center */}
              <div
                className="absolute -z-10 pointer-events-none w-[500%] left-1/2 top-1/2"
                style={{ transform: "translate(-6.24%, -96.54%)" }}
              >
                <PurplePath className="w-full" />
              </div>
              <div className="w-full h-full rotate-[8deg]">
                <Image
                  src="/characters/purple.png"
                  alt=""
                  fill
                  className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
                />
              </div>
            </div>
            <HomeHeroFloatingCard
              className="pointer-events-auto bg-[#FAF5FF] border-[#E9D5FF]"
              badge={<LogoBadge />}
              title="The ABC Club"
              description="Recently graduated with a computer science degree from the University of..."
            />
          </div>

          {/* The Alpha group: bottom-right mobile → right-center md/lg */}
          <div
            className={cn(
              "absolute flex flex-col pointer-events-none",
              "bottom-[3%] right-[2%] w-44",
              "md:bottom-auto md:top-[28%] md:right-[3%] md:w-48",
              "lg:top-[35%] lg:right-[8%] lg:w-52 xl:w-56 2xl:w-60",
            )}
          >
            <div className="relative self-center z-10 w-[58%] aspect-square -mb-2 rotate-[8deg] pointer-events-none">
              <Image
                src="/characters/purple.png"
                alt=""
                fill
                className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
              />
            </div>
            <div className="relative pointer-events-auto">
              {/* translate(-12%, -2.37%) puts the path's M(45,7) start exactly at this div's center */}
              <div
                className="absolute -z-10 pointer-events-none w-[150%] left-1/2 top-1/4"
                style={{ transform: "translate(-12%, -2.37%)" }}
              >
                <BluePath className="w-full" />
              </div>
              <HomeHeroFloatingCard
                className="bg-[#EFF6FF] border-[#BFDBFE]"
                badge={<LogoBadge />}
                title="The Alpha"
                description="Recently graduated with a computer science degree from the University of..."
              />
            </div>
          </div>

          {/* Bar Night group: bottom-left mobile → center-bottom md/lg */}
          <div
            className={cn(
              "absolute flex flex-col pointer-events-none",
              "bottom-[3%] left-[2%] w-44",
              "md:left-[33%] md:bottom-[6%] md:w-48",
              "lg:left-[44%] lg:bottom-[8%] lg:w-52 xl:w-56 2xl:w-64",
            )}
          >
            <div className="relative self-center z-10 w-[75%] aspect-[450/384] -mb-2 pointer-events-none">
              <Image
                src="/hero/character-gathering.png"
                alt=""
                fill
                className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
              />
            </div>
            <div className="relative pointer-events-auto">
              {/* translate(-83.57%, -3.23%) puts the path's M(234,6) start exactly at this div's center */}
              <div
                className="absolute -z-10 pointer-events-none w-[150%] left-1/2 top-1/2"
                style={{ transform: "translate(-83.57%, -3.23%)" }}
              >
                <RedPath className="w-full" />
              </div>
              <HomeHeroFloatingCard
                className="bg-[#FFF1F2] border-[#FECDD3] py-1.5"
                badge={<EventBadge />}
                title="Bar Night"
                meta={
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5 shrink-0" />
                      <div className="h-2 w-14 rounded bg-slate-200" />
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      <div className="h-2 w-10 rounded bg-slate-200" />
                    </span>
                  </div>
                }
                description="Recently graduated with a computer science degree from the University of..."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
