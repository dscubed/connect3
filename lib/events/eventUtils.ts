import { EventCategory, HostedEvent } from "@/types/events/event";
import type { DateFilter, TagFilter, SortOption } from "@/components/events/EventGridFilters";

interface WeightedEvent extends HostedEvent {
  weight: number;
}

export const filterEvents = (
  events: HostedEvent[],
  search: string,
  category: string | null,
  location?: string,
  dateFilter: DateFilter = "all",
  tagFilter: TagFilter = "all",
  sortOption: SortOption = "date-asc",
) => {
  const searchLowered = search.toLowerCase().trim();
  const locationLowered = (location || "").toLowerCase().trim();
  const now = new Date();

  const filtered = events
    .reduce((accumulator: WeightedEvent[], event) => {
      const eventNameLower = event.name.toLowerCase();

      // Search filter
      if (searchLowered !== "" && !eventNameLower.includes(searchLowered)) {
        return accumulator;
      }

      // Location filter
      if (locationLowered !== "") {
        const eventLocation = event.location;
        const locationMatch =
          eventLocation &&
          (
            (eventLocation.venue?.toLowerCase().includes(locationLowered)) ||
            (eventLocation.city?.toLowerCase().includes(locationLowered)) ||
            (eventLocation.address?.toLowerCase().includes(locationLowered)) ||
            (eventLocation.country?.toLowerCase().includes(locationLowered))
          );
        if (!locationMatch) return accumulator;
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
        } else if (dateFilter === "upcoming") {
          if (eventStart < now) return accumulator;
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

  // Sort
  if (sortOption === "date-asc") {
    filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  } else if (sortOption === "date-desc") {
    filtered.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  } else if (sortOption === "name-asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === "name-desc") {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  } else if (searchLowered !== "") {
    filtered.sort((a, b) => a.weight - b.weight);
  }

  return filtered;
};
