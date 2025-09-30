import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateRequest } from "@/lib/api/auth-middleware";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the request
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !user.id) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const { data: chunks, error } = await supabase
      .from("user_files")
      .select("*")
      .eq("user_id", userId)
      .filter("visible", "eq", true) // Only fetch visible chunks
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ chunks: chunks || [] });
  } catch (error) {
    console.error("Error fetching user chunks:", error);
    return NextResponse.json(
      { error: "Failed to fetch chunks" },
      { status: 500 }
    );
  }
}
