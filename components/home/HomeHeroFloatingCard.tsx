import React from "react";
import { cn } from "@/lib/utils";

interface HomeHeroFloatingCardProps {
  title: string;
  description: string;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: "white" | "blue" | "peach";
  className?: string;
}

const VARIANT_STYLES: Record<
  NonNullable<HomeHeroFloatingCardProps["variant"]>,
  string
> = {
  white: "bg-white/90 border-white/80 text-slate-700",
  blue: "bg-sky-100/85 border-white/70 text-slate-700",
  peach: "bg-rose-100/85 border-white/70 text-slate-700",
};

export function HomeHeroFloatingCard({
  title,
  description,
  meta,
  badge,
  variant = "white",
  className,
}: HomeHeroFloatingCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-2 shadow-[0_16px_36px_-22px_rgba(40,20,80,0.45)] backdrop-blur-sm font-light",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {badge}
        <div className="text-sm font-semibold leading-tight">{title}</div>
      </div>
      {meta && <div className="mt-1 text-[11px] text-slate-400">{meta}</div>}
      <p className="mt-1 text-xs leading-snug text-slate-500">
        {description}
      </p>
    </div>
  );
}
