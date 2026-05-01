import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function getClubProfiles(clubIds: string[]) {
  if (clubIds.length === 0) return new Map<string, unknown>();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, first_name, avatar_url")
    .in("id", clubIds);

  if (error) throw new Error(error.message);

  return new Map((data ?? []).map((profile) => [profile.id, profile]));
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [binding, memberships] = await Promise.all([
      supabaseAdmin
        .from("membership_email_bindings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabaseAdmin
        .from("club_memberships")
        .select(
          "id, club_id, verified_email, matched_product_name, verified_at",
        )
        .eq("user_id", user.id)
        .order("verified_at", { ascending: false }),
    ]);

    if (binding.error) {
      return NextResponse.json(
        { error: binding.error.message },
        { status: 500 },
      );
    }
    if (memberships.error) {
      return NextResponse.json(
        { error: memberships.error.message },
        { status: 500 },
      );
    }

    const clubs = await getClubProfiles(
      (memberships.data ?? []).map((membership) => membership.club_id),
    );
    const membershipsWithClubs = (memberships.data ?? []).map((membership) => ({
      ...membership,
      club: clubs.get(membership.club_id) ?? null,
    }));

    return NextResponse.json({
      data: {
        binding: binding.data ?? null,
        memberships: membershipsWithClubs,
      },
    });
  } catch (error) {
    console.error("GET /api/memberships/me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
