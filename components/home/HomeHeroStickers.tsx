import React from "react";
import Image from "next/image";

export function HomeHeroStickers() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute left-[16%] top-0 w-[clamp(110px,18%,300px)] aspect-[651/416]">
          <Image
            src="/hero/blue-star.png"
            alt=""
            fill
            className="object-contain drop-shadow-[0_10px_12px_rgba(60,40,120,0.25)]"
          />
        </div>
        <div className="absolute left-[7%] bottom-0 w-[clamp(90px,15%,230px)] aspect-square">
          <div className="relative h-full w-full">
            <Image
              src="/hero/red-star.png"
              alt=""
              fill
              className="object-contain drop-shadow-[0_12px_14px_rgba(80,40,120,0.25)]"
            />
          </div>
        </div>
        <div className="absolute left-[74.5%] bottom-0 w-[clamp(140px,18%,320px)] aspect-[644/476]">
          <Image
            src="/hero/yellow-star.png"
            alt=""
            fill
            className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
          />
        </div>
        <div className="absolute right-0 top-[5%] w-[clamp(110px,15%,280px)] aspect-[278/304] z-20">
          <Image
            src="/hero/purple-cloud.png"
            alt=""
            fill
            className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
          />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-30">
        <div className="absolute left-[51%] bottom-[16%] w-[clamp(80px,13%,200px)] aspect-[450/384] z-[60]">
          <Image
            src="/hero/character-gathering.png"
            alt=""
            fill
            className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
          />
        </div>
        {/* purple characters moved into background clusters so they move with vectors */}
      </div>
    </>
  );
}
