import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { eventSchema, type Event } from "@/lib/schemas/events/event";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

/**
 * Transform database event record to match our event schema
 */
function transformDbEventToEventSchema(dbEvent: any): Event {
  // Map the database fields to the schema fields
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    creatorProfileId: dbEvent.creator_profile_id,
    description: dbEvent.description,
    bookingUrl: dbEvent.booking_link,
    start: dbEvent.start,
    end: dbEvent.end,
    publishedAt: dbEvent.created_at || new Date().toISOString(),
    isOnline: dbEvent.location_type === 'online',
    capacity: dbEvent.capacity || 50, // default capacity
    currency: dbEvent.currency || 'USD', // default currency
    thumbnail: dbEvent.thumbnail,
    category: {
      type: dbEvent.event_categories?.type || 'other',
      category: dbEvent.event_categories?.category || 'general',
      subcategory: dbEvent.event_categories?.subcategory || 'none'
    },
    location: {
      venue: dbEvent.event_locations?.venue || 'TBA',
      address: dbEvent.event_locations?.address || 'TBA',
      latitude: dbEvent.event_locations?.latitude || 0,
      longitude: dbEvent.event_locations?.longitude || 0,
      city: dbEvent.event_locations?.city || 'TBA',
      country: dbEvent.event_locations?.country || 'TBA'
    },
    openaiFileId: dbEvent.openai_file_id
  };
}

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
      .select(`
        *,
        event_categories!inner (
          type,
          category,
          subcategory
        ),
        event_locations!inner (
          venue,
          address,
          latitude,
          longitude,
          city,
          country
        )
      `)
      .order("created_at", { ascending: false });

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
    
    // Transform the database records to match our event schema
    const typedEvents: Event[] = events.map(transformDbEventToEventSchema);
    
    const newCursor = morePagesExist ? data[limit - 1].created_at : null;
    return NextResponse.json({ items: typedEvents, cursor: newCursor });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

/**
 * Create new event
 * @param request
 */
export async function POST(request: NextRequest) {
  return new NextResponse("WILL BE REMOVED");
  // const body = await request.json();
  // const {
  //   id,
  //   name,
  //   start,
  //   end,
  //   description,
  //   type,
  //   thumbnailUrl,
  //   creator_profile_id,
  //   collaborators,
  //   booking_link,
  //   pricing,
  //   city,
  //   location_type,
  //   location_id,
  //   category_id,
  // } = createEventBodySchema.parse(body);

  // try {
  //   const { data: event, error: eventError } = await supabase
  //     .from("events")
  //     .insert({
  //       id,
  //       name,
  //       start,
  //       end,
  //       description,
  //       type,
  //       thumbnail_url: thumbnailUrl,
  //       creator_profile_id,
  //       booking_link,
  //       pricing,
  //       city,
  //       location_type,
  //       location_id,
  //       category_id,
  //     })
  //     .select(`
  //       *,
  //       event_categories!inner (
  //         type,
  //         category,
  //         subcategory
  //       ),
  //       event_locations!inner (
  //         venue,
  //         address,
  //         latitude,
  //         longitude,
  //         city,
  //         country
  //       )
  //     `)
  //     .single();

  //   if (eventError) {
  //     return NextResponse.json({ error: eventError.message }, { status: 500 });
  //   }

  //   // insert collaborators if provided
  //   if (collaborators && collaborators.length > 0) {
  //     const collaboratorInserts = collaborators.map((collaboratorId) => ({
  //       event_id: id,
  //       profile_id: collaboratorId,
  //     }));

  //     const { error: collabError } = await supabase
  //       .from("event_collaborators")
  //       .insert(collaboratorInserts);

  //     if (collabError) {
  //       // rollback changes and remove the event
  //       console.error("Error inserting collaborators:", collabError);
  //       await supabase.from("events").delete().eq("id", id);
  //       return NextResponse.json(
  //         { error: "Failed to add collaborators" },
  //         { status: 500 }
  //       );
  //     }
  //   }

  //   // Transform the created event to match our event schema
  //   const typedEvent: Event = transformDbEventToEventSchema(event);

  //   return NextResponse.json({ event: typedEvent }, { status: 201 });
  // } catch (error) {
  //   return NextResponse.json({ error: error }, { status: 500 });
  // }
}
