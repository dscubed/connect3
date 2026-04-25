import React from "react";
import Image from "next/image";

export function HomeHeroStickers() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[0]">
      {/* Blue star: top-left half-cropped on mobile, moves to center-top on md+ */}
      <div className="absolute -left-8 -top-4 w-[160px] sm:left-[16%] sm:top-0 sm:w-[220px] lg:w-[260px] aspect-[651/416]">
        <Image
          src="/hero/blue-star.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_10px_12px_rgba(60,40,120,0.25)]"
        />
      </div>
      <div className="absolute hidden sm:block left-[7%] bottom-0 w-[160px] lg:w-[200px] aspect-square">
        <Image
          src="/hero/red-star.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_12px_14px_rgba(80,40,120,0.25)]"
        />
      </div>
      <div className="absolute hidden sm:block left-[74.5%] bottom-0 w-[180px] lg:w-[240px] aspect-[644/476]">
        <Image
          src="/hero/yellow-star.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
        />
      </div>
      {/* Purple cloud: top-right half-cropped on mobile, stays right on md+ */}
      <div className="absolute -right-6 -top-4 w-[140px] sm:right-0 sm:top-[5%] sm:w-[170px] lg:w-[210px] aspect-[278/304] z-20">
        <Image
          src="/hero/purple-cloud.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
        />
      </div>
    </div>
  );
}
