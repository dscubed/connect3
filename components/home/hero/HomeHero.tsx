"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HomeHeroStickers } from "./HomeHeroStickers";
import { HomeHeroFloatingCard } from "./HomeHeroFloatingCard";
import { PurplePath, BluePath, RedPath } from "./illustrations/HeroPaths";
import { HeroActions } from "./HeroActions";
import { cn } from "@/lib/utils";
import { HomeHeroBackground } from "./HomeHeroBackground";
import {
  LogoBadge,
  EventBadge,
  HeroHeading,
  BarNightMeta,
  FLOAT_ABC,
  FLOAT_ALPHA,
  FLOAT_BAR_NIGHT,
} from "./HeroShared";

export function HomeHero() {
  return (
    <section className="relative isolate w-full h-full min-h-[360px] hidden sm:block rounded-b-[4rem] shadow-lg">
      {/* Clipped decorative layer — keeps bg + stickers within the hero bounds */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[4rem]">
        <HomeHeroBackground />
        <div className="absolute inset-0 z-[100] pointer-events-none">
          <HomeHeroStickers />

          {/* ABC Club — trail static, illustration + card float together */}
          <div
            className={cn(
              "absolute flex flex-col pointer-events-none",
              "top-[1%] left-1/2 -translate-x-1/2 w-44",
              "sm:translate-x-0 sm:left-[42%] sm:top-[2%] sm:w-48",
              "lg:left-[56%] lg:top-[3%] lg:w-52 xl:w-56 2xl:w-60",
            )}
          >
            <div className="relative self-center w-[58%] aspect-square -mb-2 pointer-events-none">
              <div
                className="absolute -z-10 pointer-events-none w-[500%] left-1/2 top-1/2"
                style={{ transform: "translate(-6.24%, -96.54%)" }}
              >
                <PurplePath className="w-full" />
              </div>
              <motion.div className="w-full h-full" {...FLOAT_ABC}>
                <div className="w-full h-full rotate-[8deg]">
                  <Image
                    src="/characters/purple.png"
                    alt=""
                    fill
                    className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
                  />
                </div>
              </motion.div>
            </div>
            <motion.div {...FLOAT_ABC}>
              <HomeHeroFloatingCard
                className="pointer-events-auto bg-[#FAF5FF] border-[#E9D5FF]"
                badge={<LogoBadge />}
                title="The ABC Club"
                description=""
              />
            </motion.div>
          </div>

          {/* The Alpha — trail static inside card container */}
          <div
            className={cn(
              "absolute flex flex-col pointer-events-none",
              "bottom-[3%] right-[2%] w-44",
              "sm:bottom-auto sm:top-[28%] sm:right-[3%] sm:w-48",
              "lg:top-[35%] lg:right-[8%] lg:w-52 xl:w-56 2xl:w-60",
            )}
          >
            <motion.div
              className="relative self-center z-10 w-[58%] aspect-square -mb-2 pointer-events-none"
              {...FLOAT_ALPHA}
            >
              <div className="w-full h-full rotate-[8deg]">
                <Image
                  src="/characters/purple.png"
                  alt=""
                  fill
                  className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
                />
              </div>
            </motion.div>
            <div className="relative pointer-events-auto">
              <div
                className="absolute -z-10 pointer-events-none w-[150%] left-1/2 top-1/4"
                style={{ transform: "translate(-12%, -2.37%)" }}
              >
                <BluePath className="w-full" />
              </div>
              <motion.div {...FLOAT_ALPHA}>
                <HomeHeroFloatingCard
                  className="bg-[#EFF6FF] border-[#BFDBFE]"
                  badge={<LogoBadge />}
                  title="The Alpha"
                  description=""
                />
              </motion.div>
            </div>
          </div>

          {/* Bar Night — trail static inside card container */}
          <div
            className={cn(
              "absolute flex flex-col pointer-events-none",
              "bottom-[3%] left-[2%] w-44",
              "sm:left-[33%] sm:bottom-[4%] sm:w-48",
              "lg:left-[44%] lg:bottom-[4%] lg:w-52 xl:w-56 2xl:w-64",
            )}
          >
            <motion.div
              className="relative self-center z-10 w-[75%] aspect-[450/384] -mb-2 pointer-events-none"
              {...FLOAT_BAR_NIGHT}
            >
              <Image
                src="/hero/character-gathering.png"
                alt=""
                fill
                className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
              />
            </motion.div>
            <div className="relative pointer-events-auto">
              <div
                className="absolute -z-10 pointer-events-none w-[150%] left-1/2 top-1/4"
                style={{ transform: "translate(-83.57%, -3.23%)" }}
              >
                <RedPath className="w-full" />
              </div>
              <motion.div {...FLOAT_BAR_NIGHT}>
                <HomeHeroFloatingCard
                  className="bg-[#FFF1F2] border-[#FECDD3] py-1.5"
                  badge={<EventBadge />}
                  title="Bar Night"
                  meta={<BarNightMeta />}
                  description=""
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="relative z-[110] flex h-full flex-col justify-center px-4 md:px-6 lg:px-8 xl:px-12 py-5 md:py-8 lg:py-12 md:max-w-[48%]">
        <div className="flex flex-col gap-2 md:gap-3 lg:gap-4 text-center sm:text-start items-center sm:items-start">
          <HeroHeading />
          <HeroActions className="flex flex-wrap gap-3 mt-1" />
        </div>
      </div>
    </section>
  );
}
