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
      if (dateFilter !== "all") {
        const eventStart = new Date(event.start);
        if (dateFilter === "today") {
          if (
            eventStart.getFullYear() !== now.getFullYear() ||
            eventStart.getMonth() !== now.getMonth() ||
            eventStart.getDate() !== now.getDate()
          ) return accumulator;
        } else if (dateFilter === "this-week") {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          if (eventStart < weekStart || eventStart >= weekEnd) return accumulator;
        } else if (dateFilter === "this-month") {
          if (
            eventStart.getFullYear() !== now.getFullYear() ||
            eventStart.getMonth() !== now.getMonth()
          ) return accumulator;
        } else if (dateFilter === "past") {
          if (eventStart >= now) return accumulator;
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

  // Sort by most recent event first (events with start dates come first, sorted by start date descending,
  // events without start dates come last in no particular order)
  return sortEvents(filtered);
};

export const getFeaturedEvents = (events: Event[]) => {
  const sorted = sortEvents(events);
  return sorted.slice(0, 8);
}

const sortEvents = (events: Event[]) => {
  events.sort((a, b) => {
    const aHasStartDate = !!a.start;
    const bHasStartDate = !!b.start;

    // If one has start date and the other doesn't, the one with start date comes first
    if (aHasStartDate && !bHasStartDate) {
      return -1;
    }
    if (!aHasStartDate && bHasStartDate) {
      return 1;
    }

    // If both have start dates, sort by start date descending (most recent first)
    if (aHasStartDate && bHasStartDate) {
      const aDate = new Date(a.start);
      const bDate = new Date(b.start);
      return bDate.getTime() - aDate.getTime(); // Descending order (most recent first)
    }

    // If neither has start dates, their order doesn't matter
    return 0;
  });
  return events;
}
