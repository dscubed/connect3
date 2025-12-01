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
 * Paginated retrieval of many events
 * @param request 
 * @param param1 
 * @returns 
 */
export async function GET(request: NextRequest) {
    // const authResult = await authenticateRequest(request);
    // if (authResult instanceof NextResponse) {
    //     return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    // }  

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10");

    try {
        let query = supabase
            .from("events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit + 1)

        // if cursor is provided take only items before it
        if (cursor) {
            query = query.lt("created_at", cursor);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // check if more pages exist
        const hasNext = data.length > limit; 

        // if it does remove the final item and use its timestamp as the cursor
        const events = hasNext ? data.slice(0, limit) : data;
        const newCursor = hasNext ? data[limit - 1].created_at : null;
        
        return NextResponse.json({ events: events, cursor: newCursor });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}