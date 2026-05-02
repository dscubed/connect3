"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HomeHeroStickers } from "./HomeHeroStickers";
import { HomeHeroFloatingCard } from "./HomeHeroFloatingCard";
import { PurplePath, BluePath, RedPath } from "./illustrations/HeroPaths";
import { HeroActions } from "./HeroActions";
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

export function MobileHomeHero() {
  return (
    <section className="relative isolate w-full h-[calc(100dvh-3.5rem)] overflow-hidden sm:h-full rounded-b-[4rem]">
      <HomeHeroBackground />
      <HomeHeroStickers />

      <div className="relative z-[100] flex flex-col items-center h-full px-4 pt-8 pb-4 justify-between">
        {/* ABC Club — trail static, illustration + card float together */}
        <div className="flex flex-col w-40 pointer-events-none">
          <div className="relative self-center w-24 h-24 -mb-2">
            <div
              className="absolute -z-10 pointer-events-none w-[500%] left-1/2 top-1/2"
              style={{ transform: "translate(-6.24%, -96.54%)" }}
            >
              <PurplePath className="w-full" id="m-purple-gradient" />
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

        {/* Heading + actions */}
        <div className="flex flex-col gap-2 items-center text-center">
          <HeroHeading />
          <HeroActions className="flex flex-wrap gap-3 mt-1 justify-center" />
        </div>

        {/* Bottom cards row */}
        <div className="flex w-full justify-between gap-2 px-2 pb-2">
          {/* Bar Night — trail static inside card container */}
          <div className="flex flex-col w-40 pointer-events-none">
            <motion.div
              className="relative self-center w-28 h-24 -mb-2"
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
                className="absolute -z-10 pointer-events-none w-[150%] left-1/2 top-1/2"
                style={{ transform: "translate(-83.57%, -3.23%)" }}
              >
                <RedPath className="w-full" id="m-red-gradient" />
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

          {/* The Alpha — trail static inside card container */}
          <div className="flex flex-col w-40 pointer-events-none">
            <motion.div
              className="relative self-center w-24 h-24 -mb-2"
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
                className="absolute -z-10 pointer-events-none w-[150%] left-1/2 top-1/2"
                style={{ transform: "translate(-12%, -2.37%)" }}
              >
                <BluePath className="w-full" id="m-blue-gradient" />
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
        </div>
      </div>
    </section>
  );
}
