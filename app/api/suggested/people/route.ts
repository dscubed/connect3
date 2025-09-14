import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET() {
  try {
    // Fetch 6 random profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        avatar_url,
        location,
        tldr,
        status
      `
      )
      .eq("onboarding_completed", true) // Only show completed profiles
      .order("created_at", { ascending: false })
      .limit(20); // Get more than needed for random selection

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Randomly select 6 profiles
    const shuffledProfiles = profiles?.sort(() => 0.5 - Math.random()) || [];
    const selectedProfiles = shuffledProfiles.slice(0, 6);

    return NextResponse.json({
      success: true,
      profiles: selectedProfiles,
      count: selectedProfiles.length,
    });
  } catch (error) {
    console.error("Get suggested profiles error:", error);
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
