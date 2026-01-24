"use client";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import { useEventCache } from "./hooks/useEventCache";
import { CubeLoader } from "@/components/ui/CubeLoader";

interface EventSheetProps {
  eventId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventSheet({ eventId, isOpen, onClose }: EventSheetProps) {
  const { event, isLoading, error } = useEventCache(eventId);

  if (!eventId) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full !max-w-3xl sm:!max-w-3xl p-0 overflow-hidden bg-white">
        <SheetTitle className="sr-only">Event Details</SheetTitle>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <CubeLoader size={48} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-destructive">
            Failed to load event. Please try again.
          </div>
        ) : event ? (
          <div className="p-4 sm:p-6 h-full overflow-y-auto">
            <EventDetailPanel event={event} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Event not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
