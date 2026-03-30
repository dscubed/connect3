"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { type Event } from "@/lib/schemas/events/event";

const TICKETING_URL =
  process.env.NEXT_PUBLIC_TICKETING_URL ?? "https://tix.connect3.app";

interface EventDetailPanelProps {
  event: Event;
  onBack?: () => void;
  mode?: "view" | "edit";
}

export function EventDetailPanel({
  event,
  onBack,
  mode = "view",
}: EventDetailPanelProps) {
  const [loaded, setLoaded] = useState(false);

  const src =
    mode === "edit"
      ? `${TICKETING_URL}/events/${event.id}/edit`
      : `${TICKETING_URL}/events/${event.id}`;

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "CONNECT3_CLOSE_PANEL") {
        onBack?.();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onBack]);

  return (
    <div className="relative h-full w-full flex flex-col">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
        </div>
      )}
      <iframe
        key={src}
        src={src}
        title={event.name}
        className="flex-1 w-full border-0 h-full"
        onLoad={() => setLoaded(true)}
        allow="fullscreen"
      />
    </div>
  );
}
