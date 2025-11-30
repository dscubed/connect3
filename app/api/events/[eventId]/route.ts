import { authenticateRequest } from "@/lib/api/auth-middleware";
import { fetchEvent } from "@/lib/events/fetchEvents";
import { NextRequest, NextResponse } from "next/server";

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
    // const authResult = await authenticateRequest(request);
    // if (authResult instanceof NextResponse) {
    //     return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    // } 

    const { eventId } = await params;
    try {
        const event = await fetchEvent(eventId);
        if (!event) {
            return NextResponse.json({ error: "Could not fetch"})
        }

        return NextResponse.json({ event: event });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}