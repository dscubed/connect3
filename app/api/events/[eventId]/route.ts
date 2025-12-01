import { authenticateRequest } from "@/lib/api/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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
    // const authResult = await authenticateRequest(request);
    // if (authResult instanceof NextResponse) {
    //     return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    // } 

    const { eventId } = await params;
    try {
        const { data: event, error } = await supabase
            .from("events")
            .select("id, name, description, start, end, type")
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