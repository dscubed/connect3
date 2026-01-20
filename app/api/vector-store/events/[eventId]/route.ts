import { authenticateRequest } from "@/lib/api/auth-middleware";
import { createEventBodySchema } from "@/lib/schemas/api/events";
import { fetchUserDetails } from "@/lib/users/fetchUserDetails";
import { EventFile, EventFilePricing } from "@/types/events/event";
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
      id: eventId, // Use the event ID from the URL parameter
    });

    const {
      name,
      start,
      end,
      description,
      type,
      pricing,
      city,
      location_type,
      university,
    } = event;

    const creator = await fetchUserDetails(user.id);
    if (!creator) {
      console.error("Error fetching creator");
      return NextResponse.json(
        { error: "Failed to fetch creator details" },
        { status: 500 }
      );
    }

    // change this to the clubs table later
    // Fetch collaborators based on event_collaborators table
    const { data, error: collabError } = await supabase
      .from("event_collaborators")
      .select(
        `
        profiles ( first_name, university )
      `
      )
      .eq("event_id", eventId);

    if (collabError) {
      console.error("Error fetching collaborators: ", collabError);
      return NextResponse.json(
        {
          error:
            "Failed to fetch collaborators. This could be because we switched to the clubs table. Edit route.ts under /api/vector-store/events",
        },
        { status: 500 }
      );
    }

    const collaboratorNames = data
      .flatMap((item) => item.profiles)
      .map((profile) => profile.first_name);

    const universities = Array.from(
      new Set([
        ...data
          .flatMap((item) => item.profiles)
          .map((profile) => profile.university)
          .filter((uni): uni is string => typeof uni === "string"),
        ...(creator.university ? [creator.university] : []),
      ])
    );

    // Get vector store ID from environment variables
    const vectorStoreId = process.env.OPENAI_EVENTS_VECTOR_STORE_ID;
    if (!vectorStoreId) {
      throw new Error(
        "Events Vector Store ID not configured in environment variables"
      );
    }

    const filePricing: EventFilePricing =
      event.pricing === "free" ? { type: "free" } : { type: "paid" };

    const eventFile: EventFile = {
      id: eventId,
      event_name: event.name,
      organisers: {
        creator: creator?.full_name || "Unknown",
        collaborators: collaboratorNames,
      },
      time: {
        start: start.getTime(),
        end: end.getTime(),
      },
      location: {
        city: event.city,
        location_type: event.location_type,
      },
      pricing: filePricing,
      description: description || "",
      type: type,
      thumbnail_url: event.thumbnailUrl,
      booking_links: event.booking_link,
      attributes: {
        university: university || [],
        start_time: start.getTime(),
        end_time: end.getTime(),
        pricing: filePricing,
        city: city,
      },
      universities: universities,
    };

    const fileContent = createEventFileContent(eventFile);
    const fileName = `event_${name.replace(/\s+/g, "_")}.json`;
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
        event_name: name,
        creator_name: creator?.full_name || "Unknown",
        collaborators: collaboratorNames.join(", "),
        type: type.join(", "),
        start_time: start.getTime(),
        end_time: end.getTime(),
        city: city.join(", "),
        pricing_type: pricing,
        location_type: location_type,
        university: (university || []).join(", "),
      },
    });

    // Update event in supabase with OpenAI file ID
    const { error: updateError } = await supabase
      .from("events")
      .update({ openai_file_id: file.id })
      .eq("id", eventId);

    if (updateError) {
      console.error("Error updating event with OpenAI file ID:", updateError);
      return NextResponse.json(
        { error: "Failed to update event with OpenAI file ID" },
        { status: 500 }
      );
    }

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

function createEventFileContent(eventFile: EventFile): string {
  return `${eventFile.event_name} (${eventFile.type?.join(", ") || "No Type"})
Organisors: ${eventFile.organisers.creator}${
    eventFile.organisers.collaborators.length > 0
      ? " with " + eventFile.organisers.collaborators.join(", ")
      : ""
  }
Time: ${new Date(eventFile.time.start).toLocaleString()} - ${new Date(
    eventFile.time.end
  ).toLocaleString()}
Location: ${eventFile.location.location_type}${
    eventFile.location.city.length > 0
      ? " in " + eventFile.location.city.join(", ")
      : ""
  }
Pricing: ${eventFile.pricing.type === "free" ? "Free" : "Paid"}
Booking Links: ${
    eventFile.booking_links && eventFile.booking_links.length > 0
      ? eventFile.booking_links.join(", ")
      : "None"
  }

${eventFile.description}`;
}
