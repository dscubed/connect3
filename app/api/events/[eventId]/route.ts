import { authenticateRequest } from "@/lib/api/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createEventBodySchema } from "@/lib/schemas/api/events";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

interface RouteParameters {
    params: Promise<{ eventId: string }>;
}

/**
 * Retrieve a single event by it's id
 * @param request 
 * @param param1 
 * @returns 
 */
export async function GET(request: NextRequest, { params }: RouteParameters) {
    const { eventId } = await params;
    try {
        const { data: event, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", eventId)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ event: event });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: RouteParameters) {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
        console.error("Unauthenticated");
      return authResult; // Return error response
    } 

    const { eventId } = await params;
    const body = await request.json();

    // Validate the body against the schema, but adjust for the event ID from the URL
    const validatedBody = createEventBodySchema.parse({
        ...body,
        id: eventId // Use the event ID from the URL parameter
    });

    const {
        id,
        name,
        start,
        end,
        description,
        type,
        creator_profile_id,
        collaborators,
        booking_link,
        pricing,
        city,
        location_type
    } = validatedBody;

    console.log("Inserting document");
    try {
        // Insert the event into the events table
        const { data: event, error: eventError } = await supabase
            .from("events")
            .insert({
                id,
                name,
                start,
                end,
                description,
                type,
                creator_profile_id,
                booking_link,
                pricing,
                city,
                location_type,
            })
            .select()
            .single();

        if (eventError) {
            console.error("Failed to insert event");
            console.error(eventError.message);
            return NextResponse.json({ error: eventError.message }, { status: 500 });
        }

        // Insert collaborators if provided
        if (collaborators && collaborators.length > 0) {
            const collaboratorInserts = collaborators.map(collaboratorId => ({
                event_id: id,
                profile_id: collaboratorId,
            }));

            const { error: collabError } = await supabase
                .from("event_collaborators")
                .insert(collaboratorInserts);

            if (collabError) {
                // Rollback: remove the event if collaborators insertion fails
                console.error("Error inserting collaborators:", collabError);
                await supabase.from("events").delete().eq("id", id);
                return NextResponse.json({ error: "Failed to add collaborators" }, { status: 500 });
            }
        }

        return NextResponse.json({ event }, { status: 201 });
    } catch (error) {
        console.log("Problem ", error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}
