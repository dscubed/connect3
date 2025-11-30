import { Event } from "@/types/events/event";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function fetchEvent(eventId: string): Promise<Event | null> {
    try {
        const { data: event, error } = await supabase
            .from("events")
            .select("id, name, description, start, end, type")
            .eq("id", eventId)
            .single();

        if (error) {
            console.error(`❌ Supabase error for event ${eventId}:`, error);
            return null;
        }

        if (!event) {
            return null;
        }

        return {
            eventId: event.id,
            name: event.name,
            start: event.start,
            end: event.end,
            description: event.description,
            type: event.type,
        } as Event

    } catch (error) {
        console.error(`❌ Error fetching event details for ${eventId}:`, error);
        return null;
    }

}