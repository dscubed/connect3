import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin/session";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );
}

async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function GET(req: NextRequest) {
  const session = await verifyAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("instagram_club_fetches")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await verifyAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Bulk import: { items: { profile_id: slug, ... } }
  if (body.items && typeof body.items === "object") {
    const entries = Object.entries(body.items) as [string, string][];
    if (entries.length === 0) {
      return NextResponse.json({ error: "items is empty" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Validate profile_ids exist so we don't violate the FK constraint
    const profileIds = entries.map(([pid]) => pid).filter(Boolean);
    const { data: validProfiles } = await supabase
      .from("profiles")
      .select("id")
      .in("id", profileIds);
    const validIds = new Set((validProfiles ?? []).map((p) => p.id));

    const skipped: string[] = [];
    const rows = entries.map(([profileId, instagramSlug]) => {
      const isValid = profileId && validIds.has(profileId);
      if (profileId && !isValid) skipped.push(profileId);
      return {
        instagram_slug: String(instagramSlug).trim().toLowerCase(),
        profile_id: isValid ? profileId : null,
        status: "queued" as const,
      };
    });

    // Filter out slugs that already exist
    const slugsToCheck = rows.map((r) => r.instagram_slug);
    const { data: existing } = await supabase
      .from("instagram_club_fetches")
      .select("instagram_slug")
      .in("instagram_slug", slugsToCheck);
    const existingSlugs = new Set(
      (existing ?? []).map((e) => e.instagram_slug),
    );
    const newRows = rows.filter((r) => !existingSlugs.has(r.instagram_slug));
    const skippedExisting = rows.length - newRows.length;

    if (newRows.length === 0) {
      return NextResponse.json({
        data: [],
        count: 0,
        warning: `All ${rows.length} slug(s) already exist — nothing added`,
      });
    }

    const { data, error } = await supabase
      .from("instagram_club_fetches")
      .insert(newRows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const warnings: string[] = [];
    if (skipped.length > 0)
      warnings.push(
        `${skipped.length} profile_id(s) not found — inserted without link`,
      );
    if (skippedExisting > 0)
      warnings.push(`${skippedExisting} slug(s) already existed — skipped`);

    return NextResponse.json({
      data,
      count: data?.length ?? 0,
      ...(warnings.length > 0 && { warning: warnings.join(". ") }),
    });
  }

  // Single add
  const { instagram_slug, profile_id } = body;

  if (!instagram_slug || typeof instagram_slug !== "string") {
    return NextResponse.json(
      { error: "instagram_slug is required" },
      { status: 400 },
    );
  }

  const slug = instagram_slug.trim().toLowerCase();

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("instagram_club_fetches")
    .upsert(
      {
        instagram_slug: slug,
        profile_id: profile_id || null,
        status: "queued",
      },
      { onConflict: "instagram_slug" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  const session = await verifyAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const allowedStatuses = [
    "queued",
    "in_progress",
    "completed",
    "failed",
    "paused",
  ];

  // Bulk update: { slugs: [...], status?, last_fetched?, profile_id? }
  if (Array.isArray(body.slugs) && body.slugs.length > 0) {
    const updates: Record<string, string | null> = {};
    if (body.status) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = body.status;
    }
    if (body.last_fetched !== undefined) {
      updates.last_fetched = body.last_fetched;
    }
    if (body.profile_id !== undefined) {
      updates.profile_id = body.profile_id;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("instagram_club_fetches")
      .update(updates)
      .in("instagram_slug", body.slugs)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count: data?.length ?? 0 });
  }

  // Single update
  const { instagram_slug, status, last_fetched, profile_id } = body;

  if (!instagram_slug) {
    return NextResponse.json(
      { error: "instagram_slug is required" },
      { status: 400 },
    );
  }

  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const updates: Record<string, string | null> = {};
  if (status) updates.status = status;
  if (last_fetched !== undefined) updates.last_fetched = last_fetched;
  if (profile_id !== undefined) updates.profile_id = profile_id;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("instagram_club_fetches")
    .update(updates)
    .eq("instagram_slug", instagram_slug)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
  const session = await verifyAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const slugsParam = searchParams.get("slugs");

  const supabase = getSupabaseAdmin();

  // Bulk delete: ?slugs=a,b,c
  if (slugsParam) {
    const slugs = slugsParam.split(",").filter(Boolean);
    if (slugs.length === 0) {
      return NextResponse.json({ error: "No slugs provided" }, { status: 400 });
    }
    const { error } = await supabase
      .from("instagram_club_fetches")
      .delete()
      .in("instagram_slug", slugs);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, count: slugs.length });
  }

  // Single delete
  if (!slug) {
    return NextResponse.json(
      { error: "slug query param is required" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("instagram_club_fetches")
    .delete()
    .eq("instagram_slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
