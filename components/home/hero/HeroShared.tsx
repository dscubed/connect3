import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoBadge({ className }: { className?: string }) {
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

export function EventBadge() {
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

export function HeroHeading() {
  return (
    <>
      <h1 className="font-fredoka text-4xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold leading-[1.05] text-slate-800">
        IT TAKES <span className="home-hero-scribble">THREE</span> <br />
        TO CONNECT
      </h1>
      <p className="text-sm lg:text-base text-slate-600">
        find events, clubs and students all-in-one
      </p>
    </>
  );
}

export function BarNightMeta() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1">
        <Calendar className="h-2.5 w-2.5 shrink-0" />
        <div className="h-2 w-12 rounded bg-slate-200" />
      </span>
      <span className="flex items-center gap-1">
        <MapPin className="h-2.5 w-2.5 shrink-0" />
        <div className="h-2 w-8 rounded bg-slate-200" />
      </span>
    </div>
  );
}

// Each card gets a unique drift path: bottom-left → bottom-right → up → return.
// Paired keyframes create the pause at each waypoint.
// Illustration and card use the same config so they stay in sync while the trail stays static.

export const FLOAT_ABC = {
  animate: {
    x: [0, -3, -3, 2, 2, 0, 0, 0],
    y: [0, 3, 3, 3, 3, -3, -3, 0],
  },
  transition: {
    duration: 12,
    times: [0, 0.12, 0.18, 0.36, 0.43, 0.6, 0.67, 1],
    ease: "easeInOut" as const,
    repeat: Infinity,
    delay: 0,
  },
};

export const FLOAT_ALPHA = {
  animate: {
    x: [0, -2, -2, 3, 3, 1, 1, 0],
    y: [0, 4, 4, 2, 2, -3, -3, 0],
  },
  transition: {
    duration: 10,
    times: [0, 0.15, 0.22, 0.42, 0.5, 0.67, 0.75, 1],
    ease: "easeInOut" as const,
    repeat: Infinity,
    delay: 1.5,
  },
};

export const FLOAT_BAR_NIGHT = {
  animate: {
    x: [0, 2, 2, -3, -3, 0, 0, 0],
    y: [0, 3, 3, 3, 3, -2, -2, 0],
  },
  transition: {
    duration: 14,
    times: [0, 0.13, 0.2, 0.39, 0.52, 0.7, 0.78, 1],
    ease: "easeInOut" as const,
    repeat: Infinity,
    delay: 0.6,
  },
};
