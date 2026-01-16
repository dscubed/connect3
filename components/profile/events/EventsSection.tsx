import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import EventFormHeader from "./EventFormHeader";
import { useRef } from "react";
import { HostedEvent } from "@/types/events/event";
import { CubeLoader } from "@/components/ui/CubeLoader";
import ProfileEventListCard from "./ProfileEventListCard";
import { useAuthStore } from "@/stores/authStore";
import { SectionCard, SectionCardHeader } from "../SectionCard";
import { CardContent } from "@/components/ui/card";

export default function EventsSection() {
  const { user } = useAuthStore();

  const eventDisplayRef = useRef<HTMLDivElement | null>(null);
  const {
    items: events,
    isLoading,
    isValidating,
  } = useInfiniteScroll<HostedEvent>(
    eventDisplayRef,
    user ? `/api/users/${user.id}/events` : null
  );
  if (!user) return;
  if (isLoading) {
    return (
      <div>
        <CubeLoader size={60} />
        <span className="text-muted">Loading events...</span>
      </div>
    );
  }

  return (
    <SectionCard variant="white">
      <SectionCardHeader title="Events">
        <EventFormHeader />
      </SectionCardHeader>

      <CardContent>
        <div
          className="flex flex-col overflow-y-auto p-5 space-y-3 scrollbar-hide h-5/6"
          ref={eventDisplayRef}
        >
          {events.length === 0 && !isValidating ? (
            <p className="text-muted">No events hosted yet.</p>
          ) : (
            <>
              {events.map((event, i) => {
                return <ProfileEventListCard key={i} index={i} event={event} />;
              })}
            </>
          )}
          {isValidating && <p>Loading...</p>}
        </div>
      </CardContent>
    </SectionCard>
  );
}
