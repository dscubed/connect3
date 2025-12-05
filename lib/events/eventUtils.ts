import { EventCategory, HostedEvent } from "@/types/events/event";

export const filterEvents = (events: HostedEvent[], search: string, category: EventCategory | null) => {
    const searchLowered = search.toLowerCase().trim();
    const filtered = events.reduce((accumulator: any[], event) => {
        const eventNameLower = event.name.toLowerCase();
        if (searchLowered === "" || eventNameLower.includes(searchLowered)) {
            if (!category) {
                accumulator.push({
                    ...event,
                    weight: searchLowered === "" ? 0 : eventNameLower.indexOf(searchLowered)
                });
            } else if (!!event.type && event.type.includes(category)) {
                accumulator.push({
                    ...event,
                    weight: searchLowered === "" ? 0 : eventNameLower.indexOf(searchLowered)
                });
            }
        }
        return accumulator;
    }, []).sort((a, b) => a.weight - b.weight);
    return filtered;
}
