import { EventCategory, HostedEvent } from "@/types/events/event";

interface WeightedEvent extends HostedEvent {
  weight: number;
}

export const filterEvents = (
  events: HostedEvent[],
  search: string,
  category: EventCategory | null,
  location?: string,
) => {
  const searchLowered = search.toLowerCase().trim();
  const locationLowered = (location || "").toLowerCase().trim();
  const filtered = events
    .reduce((accumulator: WeightedEvent[], event) => {
      const eventNameLower = event.name.toLowerCase();
      if (searchLowered === "" || eventNameLower.includes(searchLowered)) {
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
        if (!category) {
          accumulator.push({
            ...event,
            weight:
              searchLowered === "" ? 0 : eventNameLower.indexOf(searchLowered),
          });
        } else if (!!event.category && event.category.category === category) {
          accumulator.push({
            ...event,
            weight:
              searchLowered === "" ? 0 : eventNameLower.indexOf(searchLowered),
          });
        }
      }
      return accumulator;
    }, [])
    .sort((a, b) => a.weight - b.weight);
  return filtered;
};
