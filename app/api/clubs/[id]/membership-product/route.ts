import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeProductName } from "@/lib/memberships/normalizers";

export const runtime = "nodejs";

async function requireClubAccess(clubId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (user.id !== clubId) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, account_type")
    .eq("id", clubId)
    .maybeSingle();

  if (profileError) {
    return {
      error: NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      ),
    };
  }

  if (!profile || profile.account_type !== "organisation") {
    return {
      error: NextResponse.json(
        { error: "Only organisation accounts can manage membership products" },
        { status: 403 },
      ),
    };
  }

  return { user };
}

async function getMemberProfiles(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, unknown>();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, first_name, last_name, avatar_url")
    .in("id", userIds);

  if (error) throw new Error(error.message);

  return new Map((data ?? []).map((profile) => [profile.id, profile]));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: clubId } = await params;
    const access = await requireClubAccess(clubId);
    if ("error" in access) return access.error;

    const [product, memberships, memberCount] = await Promise.all([
      supabaseAdmin
        .from("club_membership_products")
        .select("*")
        .eq("club_id", clubId)
        .maybeSingle(),
      supabaseAdmin
        .from("club_memberships")
        .select(
          "id, user_id, verified_email, matched_product_name, verified_at",
        )
        .eq("club_id", clubId)
        .order("verified_at", { ascending: false })
        .limit(25),
      supabaseAdmin
        .from("club_memberships")
        .select("id", { count: "exact", head: true })
        .eq("club_id", clubId),
    ]);

    if (product.error) {
      return NextResponse.json(
        { error: product.error.message },
        { status: 500 },
      );
    }
    if (memberships.error) {
      return NextResponse.json(
        { error: memberships.error.message },
        { status: 500 },
      );
    }
    if (memberCount.error) {
      return NextResponse.json(
        { error: memberCount.error.message },
        { status: 500 },
      );
    }

    const memberProfiles = await getMemberProfiles(
      (memberships.data ?? []).map((membership) => membership.user_id),
    );
    const members = (memberships.data ?? []).map((membership) => ({
      ...membership,
      profile: memberProfiles.get(membership.user_id) ?? null,
    }));

    return NextResponse.json({
      data: {
        product: product.data ?? null,
        members,
        memberCount: memberCount.count ?? members.length,
      },
    });
  } catch (error) {
    console.error("GET /api/clubs/[id]/membership-product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: clubId } = await params;
    const access = await requireClubAccess(clubId);
    if ("error" in access) return access.error;

    const body = (await request.json()) as {
      product_name?: string;
      enabled?: boolean;
    };
    const productName = body.product_name?.trim() ?? "";
    const enabled = body.enabled ?? true;

    if (enabled && !productName) {
      return NextResponse.json(
        { error: "UMSU product name is required" },
        { status: 400 },
      );
    }

    const row = {
      club_id: clubId,
      product_name: productName,
      normalized_product_name: normalizeProductName(productName),
      enabled,
      updated_by: access.user.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("club_membership_products")
      .upsert(row, { onConflict: "club_id" })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("PATCH /api/clubs/[id]/membership-product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
