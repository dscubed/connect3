import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createEventBodySchema } from "@/lib/schemas/api/events";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

/**
 * Cursor based paginated retrieval of many events
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10");
     
    try {
        let query = supabase
            .from("events")
            .select("*")
            .order("created_at", { ascending: false })

        if (cursor) {
            query = query.lt("created_at", cursor);
        }

        query = query.limit(limit + 1);

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const morePagesExist = data.length > limit; 

        // if it more pages exist remove the final item and use its timestamp as the cursor
        const events = morePagesExist ? data.slice(0, limit) : data;
        const newCursor = morePagesExist ? data[limit - 1].created_at : null;
        return NextResponse.json({ items: events, cursor: newCursor });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

/**
 * Create new event
 * @param request 
 */
export async function POST(request: NextRequest) {
    const body = await request.json();
    const {
        id,
        name,
        start,
        end,
        description,
        type,
        thumbnailUrl,
        creator_profile_id,
        collaborators } = createEventBodySchema.parse(body);

    try {
        const { data: event, error: eventError } = await supabase
            .from("events")
            .insert({
                id,
                name,
                start,
                end,
                description,
                type,
                thumbnail_url: thumbnailUrl,
                creator_profile_id,
            })
            .select()
            .single();

        if (eventError) {
            return NextResponse.json({ error: eventError.message }, { status: 500 });
        }

        // insert collaborators if provided
        if (collaborators && collaborators.length > 0) {
            const collaboratorInserts = collaborators.map(collaboratorId => ({
                event_id: id,
                profile_id: collaboratorId,
            }));

            const { error: collabError } = await supabase
                .from("event_collaborators")
                .insert(collaboratorInserts);

            if (collabError) {
                // rollback changes and remove the event
                console.error("Error inserting collaborators:", collabError);
                await supabase.from("events").delete().eq("id", id);
                return NextResponse.json({ error: "Failed to add collaborators" }, { status: 500 });
            }
        }

        return NextResponse.json({ event }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}