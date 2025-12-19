import { authenticateRequest } from "@/lib/api/auth-middleware";
import { createEventBodySchema } from "@/lib/schemas/api/events";
import { fetchUserDetails } from "@/lib/users/fetchUserDetails";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RouteParameters {
  params: Promise<{ eventId: string }>;
}

/**
 * 
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest, { params }: RouteParameters) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    const { user } = authResult;
    const body = await request.json();
    const { eventId } = await params;
    const event = createEventBodySchema.parse({
        ...body,
        id: eventId // Use the event ID from the URL parameter
    });

    const {
        name,
        start,
        end,
        description,
        type,
        pricing,
        city,
        location_type
    } = event;

    const creator = await fetchUserDetails(user.id);        
    if (!creator) {
      console.error("Error fetching creator");
      return NextResponse.json(
        { error: "Failed to fetch creator details"},
        { status: 500 }
      );
    }

    // change this to the clubs table later
    // Fetch collaborators based on event_collaborators table
    const { data, error: collabError } = await supabase
      .from('event_collaborators')
      .select(`
        profiles ( first_name )
      `)
      .eq('event_id', eventId);

    if (collabError) {
      console.error("Error fetching collaborators: ", collabError);
      return NextResponse.json(
        { error: "Failed to fetch collaborators. This could be because we switched to the clubs table. Edit route.ts under /api/vector-store/events" },
        { status: 500 }
      );
    }

    const collaborators = data.flatMap(item => item.profiles).map(profile => profile.first_name).join(', ');

    // Get vector store ID from environment variables
    const vectorStoreId = process.env.OPENAI_EVENTS_VECTOR_STORE_ID;
    if (!vectorStoreId) {
      throw new Error("Events Vector Store ID not configured in environment variables");
    }

    // Create file content with event description
    const fileContent = description || '';
    const fileName = `event_${name.replace(/\s+/g, '_')}.txt`;
    const fileObj = new File([fileContent], fileName, {
      type: "text/plain",
    });

    // upload to vector store

    const file = await openai.files.create({
      file: fileObj,
      purpose: "assistants",
    });

    const vectorStoreFile = await openai.vectorStores.files.createAndPoll(
      vectorStoreId,
      {
        file_id: file.id,
      }
    );

    if (vectorStoreFile.status === "failed") {
      throw new Error(
        `Failed to add file to vector store: ${
          vectorStoreFile.last_error?.message || "Unknown error"
        }`
      );
    }

    if (!file.id) {
      throw new Error("OpenAI did not return a file ID");
    }

    // attach attributes to vector store file
    await openai.vectorStores.files.update(file.id, {
      vector_store_id: vectorStoreId,
      attributes: {
        id: eventId,
        creator_name: creator?.full_name || 'Unknown',
        type: type.join(', '),
        start: start.toDateString(),
        end: end.toDateString(),
        city: city.join(', '),
        collaborators: collaborators || '',
        pricing: pricing,
        event_location_type: location_type,
        event_name: name,
      },
    });

    return NextResponse.json({
      success: true,
      uploadedFileId: file.id,
    });
  } catch (error) {
    console.error("Upload process error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
        error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}