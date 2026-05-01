import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminRows, error } = await supabaseAdmin
      .from("club_admins")
      .select(
        `id, club_id, role, status, created_at,
         club:club_id(id, first_name, last_name, avatar_url)`,
      )
      .eq("user_id", user.id)
      .eq("status", "accepted")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch clubs" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: adminRows });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
