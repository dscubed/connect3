import React from "react";
import Image from "next/image";

export function HomeHeroBackground() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#efeaff",
          backgroundImage:
            "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 45%), radial-gradient(circle at 80% 20%, rgba(196,210,255,0.65) 0%, rgba(196,210,255,0) 45%), radial-gradient(circle at 30% 85%, rgba(233,200,255,0.75) 0%, rgba(233,200,255,0) 55%)",
        }}
      />
      <div className="absolute left-[62%] top-[-1%] h-[190px] w-[450px] relative">
        <Image
          src="/hero/purple-vector.png"
          alt=""
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="absolute left-[75%] top-[29%] h-[300px] w-[430px] rotate-[-9deg] relative">
        <Image
          src="/hero/blue-vector.png"
          alt=""
          fill
          className="object-contain"
        />
      </div>
      <div className="absolute left-[37.7%] top-[30%] h-[180px] w-[300px] rotate-[18deg] relative">
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
