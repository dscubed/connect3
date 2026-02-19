"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Event } from "@/lib/schemas/events/event";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import { CubeLoader } from "@/components/ui/CubeLoader";
import Sidebar from "@/components/sidebar/Sidebar";
import { toast } from "sonner";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        if (!res.ok) {
          toast.error("Event not found");
          router.push("/events");
          return;
        }
        const data = await res.json();
        setEvent(data.event);
      } catch {
        toast.error("Could not load event");
        router.push("/events");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchEvent();
    }
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] overflow-hidden">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <div className="flex-1 flex flex-col justify-center items-center">
          <CubeLoader size={32} />
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
        <div className="max-w-4xl mx-auto">
          <EventDetailPanel
            event={event}
            onBack={() => router.push("/events")}
          />
        </div>
      </div>
    </div>
  );
}
