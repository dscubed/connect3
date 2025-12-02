import { authenticateRequest } from "@/lib/api/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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
    // const authResult = await authenticateRequest(request);
    // if (authResult instanceof NextResponse) {
    //     return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    // }  

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
     
    try {
        let query = supabase
            .from("events")
            .select("*")
            .order("created_at", { ascending: false })

        if (search) {
            query = query.ilike("name", `%${search}%`)
        }

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
        return NextResponse.json({ events: events, cursor: newCursor });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}