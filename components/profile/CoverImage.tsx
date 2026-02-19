"use client";

import { useEffect, useMemo, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import {
  getMeshGradientStyle,
  getRgbFromUserId,
} from "@/lib/gradientUtils";

const PLACEHOLDER_RGB: [number, number, number] = [220, 218, 225];

interface CoverImageProps {
  userId: string;
  avatarUrl?: string | null;
}

export default function CoverImage({ userId, avatarUrl }: CoverImageProps) {
  const fallbackRgb = useMemo(
    () => getRgbFromUserId(userId),
    [userId]
  );
  const [resolvedRgb, setResolvedRgb] = useState<[number, number, number] | null>(
    avatarUrl?.trim() ? null : fallbackRgb
  );

  useEffect(() => {
    if (!avatarUrl?.trim()) {
      setResolvedRgb(fallbackRgb);
      return;
    }

    setResolvedRgb(null);
    let cancelled = false;
    const fac = new FastAverageColor();

    fac
      .getColorAsync(avatarUrl, {
        algorithm: "dominant",
        crossOrigin: "anonymous",
      })
      .then((result) => {
        if (cancelled) return;
        const [r, g, b] = result.value;
        setResolvedRgb([r, g, b]);
      })
      .catch(() => {
        if (cancelled) return;
        setResolvedRgb(fallbackRgb);
      })
      .finally(() => {
        fac.destroy();
      });

    return () => {
      cancelled = true;
    };
  }, [avatarUrl, fallbackRgb]);

  const rgb = resolvedRgb ?? (avatarUrl?.trim() ? PLACEHOLDER_RGB : fallbackRgb);
  const gradientStyle = getMeshGradientStyle(rgb[0], rgb[1], rgb[2]);

  return (
    <div
      className="relative h-48 w-full shrink-0 overflow-hidden rounded-none md:rounded-xl"
      style={{
        minHeight: "12rem",
        ...gradientStyle,
        backgroundColor: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
      }}
    />
  );
}
