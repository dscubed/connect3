import React from "react";
import Image from "next/image";

export function HomeHeroBackground() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top right, #864EFF 30%, #BCEAF3 100%)",
          opacity: 0.4,
        }}
      />
      <div className="absolute left-[62.1%] top-0 w-[clamp(120px,28%,420px)] aspect-[491/197]">
        <div className="relative h-full w-full">
          <Image
            src="/hero/purple-vector.png"
            alt=""
            fill
            className="object-contain"
            priority
          />
          <div className="absolute left-[-5%] top-[40%] w-[30%] aspect-square rotate-[8deg] z-30">
            <Image
              src="/characters/purple.png"
              alt=""
              fill
              className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
            />
          </div>
        </div>
      </div>
      <div className="absolute right-0 bottom-[15%] w-[clamp(70px,14%,260px)] aspect-[521/589]">
        <div className="relative h-full w-full">
          <Image
            src="/hero/blue-vector.png"
            alt=""
            fill
            className="object-contain rotate-[-9deg]"
          />
          <div className="absolute left-[-30%] top-[-58%] w-[62%] aspect-square rotate-[8deg] z-30">
            <Image
              src="/characters/purple.png"
              alt=""
              fill
              className="object-contain drop-shadow-[0_12px_16px_rgba(80,40,120,0.25)]"
            />
          </div>
        </div>
      </div>
      <div className="absolute left-[43%] bottom-0 w-[clamp(90px,15%,280px)] aspect-[559/371]">
        <Image
          src="/hero/red-vector.png"
          alt=""
          fill
          className="object-contain"
        />
      </div>
      <div className="home-hero-noise absolute inset-0" />
    </div>
  );
}
