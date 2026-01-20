"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import IllustrationPng from "@/components/illustration/illustration.png";

type Props = {
  className?: string;
  priority?: boolean;
};

export function AuthIllustrationImage({ className, priority = false }: Props) {
  return (
    <div className={cn("relative h-full w-full", className)} aria-hidden="true">
      <Image
        src={IllustrationPng}
        alt=""
        fill
        priority={priority}
        className="object-cover" // fill the whole right side
        sizes="(min-width: 1024px) 50vw, 0px"
      />
    </div>
  );
}
