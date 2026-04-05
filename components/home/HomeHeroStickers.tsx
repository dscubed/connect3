import React from "react";
import Image from "next/image";

export function HomeHeroStickers() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute left-[16%] top-[-6%] h-[300px] w-[300px] relative">
        <Image
          src="/hero/blue-star.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_10px_12px_rgba(60,40,120,0.25)]"
        />
      </div>
      <div className="absolute left-[7%] top-[37%] h-[250px] w-[250px] relative">
        <Image
          src="/hero/red-star.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_12px_14px_rgba(80,40,120,0.25)]"
        />
      </div>
      <div className="absolute left-[75%] top-[8.5%] h-[300px] w-[300px] relative">
        <Image
          src="/hero/yellow-star.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
        />
      </div>
      <div className="absolute right-[-1%] top-[2%] h-[300px] w-[300px] z-20">
        <Image
          src="/hero/purple-cloud.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
        />
      </div>
      <div className="absolute right-[30.6%] top-[60.5%] h-[220px] w-[220px] z-20">
        <Image
          src="/hero/character-gathering.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
        />
      </div>
      <div className="absolute right-[10.9%] top-[40.1%] h-[145px] w-[150px] rotate-[8deg] z-20">
        <Image
          src="/characters/purple.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
        />
      </div>
      <div className="absolute right-[30%] top-[10.7%] h-[145px] w-[150px] rotate-[8deg] z-20">
        <Image
          src="/characters/purple.png"
          alt=""
          fill
          className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
        />
      </div>
    </div>
  );
}
