"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { HomeHeroBackground } from "./HomeHeroBackground";
import { HomeHeroStickers } from "./HomeHeroStickers";
import { HomeHeroFloatingCard } from "./HomeHeroFloatingCard";
import { SearchInput } from "../search/SearchInput";
import { Calendar, MapPin } from "lucide-react";
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
    <section className="w-full">
      <div className="relative w-full aspect-[1271/670]">
        <div className="absolute inset-0 overflow-hidden rounded-none shadow-[0_30px_70px_-45px_rgba(60,40,120,0.55)]">
          <HomeHeroBackground />
          <HomeHeroStickers />
          <div className="relative z-[80] grid h-full grid-cols-1 items-center gap-[clamp(1.5rem,3.5vw,2.5rem)] px-[clamp(1.5rem,4.5vw,3.5rem)] py-[clamp(1.25rem,3.8vw,3.5rem)] md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-4 self-center lg:ml-4 lg:-mt-2">
              <h1 className="font-fredoka text-[clamp(0.5rem,3.6vw,5rem)] font-semibold leading-[1.05] text-slate-800">
                IT TAKES <span className="home-hero-scribble">THREE</span> TO CONNECT
              </h1>
              <p className="text-[clamp(0.75rem,1.6vw,0.95rem)] text-slate-600">
                find events, clubs and students all-in-one
              </p>
              <SearchInput
                className="w-[clamp(18rem,28vw,36rem)]"
                onSubmit={handleSearch}
              />
            </div>
            <div className="relative hidden md:block h-full z-[100]">
              <HomeHeroFloatingCard
                className="absolute top-[16%] left-[2%] w-[clamp(140px,20vw,240px)] bg-[#FAF5FF] border-[#E9D5FF]"
                badge={<LogoBadge />}
                title="The ABC Club"
                description="Recently graduated with a computer science degree from the University of..."
              />
              <HomeHeroFloatingCard
                className="absolute top-[50%] right-[8%] w-[clamp(140px,20vw,240px)] bg-[#EFF6FF] border-[#BFDBFE]"
                badge={<LogoBadge />}
                title="The Alpha"
                description="Recently graduated with a computer science degree from the University of..."
              />
              <HomeHeroFloatingCard
                className="absolute bottom-[8%] left-[-20%] w-[clamp(152px,20.5vw,255px)] bg-[#FFF1F2] border-[#FECDD3] py-1.5"
                badge={<EventBadge />}
                title="Bar Night"
                meta={
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />Mar 29, 2025</span>
                    <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />Top Club</span>
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
