import { HostedEvent } from "@/types/events/event";
import type { DateFilter, TagFilter } from "@/components/events/EventGridFilters";
import { Event } from "../schemas/events/event";

interface WeightedEvent extends HostedEvent {
  weight: number;
}

export const filterEvents = (
  events: Event[],
  search: string,
  category: string | null,
  dateFilter: DateFilter = "all",
  tagFilter: TagFilter = "all",
) => {
  const searchLowered = search.toLowerCase().trim();
  const now = new Date();

  const filtered = events
    .reduce((accumulator: WeightedEvent[], event) => {
      const eventNameLower = event.name.toLowerCase();

      // Search filter
      if (searchLowered !== "" && !eventNameLower.includes(searchLowered)) {
        return accumulator;
      }

      // Category filter
      if (category && event.category !== category) {
        return accumulator;
      }

      // Date filter
      const eventStart = new Date(event.start);
      if (dateFilter === "past") {
        if (eventStart >= now) return accumulator;
      } else {
        if (eventStart < now) return accumulator;
        if (dateFilter === "today") {
          if (
            eventStart.getFullYear() !== now.getFullYear() ||
            eventStart.getMonth() !== now.getMonth() ||
            eventStart.getDate() !== now.getDate()
          ) return accumulator;
        } else if (dateFilter === "this-week") {
          const weekEnd = new Date(now);
          weekEnd.setDate(now.getDate() - now.getDay() + 7);
          weekEnd.setHours(0, 0, 0, 0);
          if (eventStart >= weekEnd) return accumulator;
        } else if (dateFilter === "this-month") {
          if (
            eventStart.getFullYear() !== now.getFullYear() ||
            eventStart.getMonth() !== now.getMonth()
          ) return accumulator;
        }
      }

      // Tag filter
      if (tagFilter !== "all") {
        if (tagFilter === "free") {
          if (event.pricing?.min > 0 || event.pricing?.max > 0) return accumulator;
        } else if (tagFilter === "paid") {
          if (!event.pricing || (event.pricing.min === 0 && event.pricing.max === 0)) return accumulator;
        } else if (tagFilter === "online") {
          if (!event.isOnline) return accumulator;
        } else if (tagFilter === "in-person") {
          if (event.isOnline) return accumulator;
        }
      }

      accumulator.push({
        ...event,
        weight:
          searchLowered === "" ? 0 : eventNameLower.indexOf(searchLowered),
      });

      return accumulator;
    }, []);

  const isPast = dateFilter === "past";
  return sortEvents(filtered, !isPast);
};

export const getFeaturedEvents = (events: Event[]) => {
  const sorted = sortEvents(events, true);
  return sorted.slice(0, 8);
}

const sortEvents = (events: Event[], ascending: boolean = true) => {
  events.sort((a, b) => {
    const aHasStartDate = !!a.start;
    const bHasStartDate = !!b.start;

    if (aHasStartDate && !bHasStartDate) return -1;
    if (!aHasStartDate && bHasStartDate) return 1;

    if (aHasStartDate && bHasStartDate) {
      const aDate = new Date(a.start);
      const bDate = new Date(b.start);
      return ascending
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    return 0;
  });
  return events;
}
