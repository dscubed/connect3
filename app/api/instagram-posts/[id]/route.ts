import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export interface InstagramPost {
  id: string;
  posted_by: string;
  caption: string | null;
  timestamp: number;
  images: string[] | null;
  club_name: string | null;
  club_avatar_url: string | null;
  club_profile_id: string | null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createServiceClient();

  // Fetch the post
  const { data: post, error: postError } = await supabase
    .from("instagram_posts")
    .select("id, posted_by, caption, timestamp, images")
    .eq("id", id)
    .single();

  if (postError || !post) {
    return NextResponse.json({ post: null }, { status: 404 });
  }

  // Resolve club via instagram_club_fetches
  const { data: fetch } = await supabase
    .from("instagram_club_fetches")
    .select("profile_id")
    .eq("instagram_slug", post.posted_by)
    .single();

  let club_name: string | null = null;
  let club_avatar_url: string | null = null;

  if (fetch?.profile_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, avatar_url")
      .eq("id", fetch.profile_id)
      .single();

    club_name = profile?.first_name ?? null;
    club_avatar_url = profile?.avatar_url ?? null;
  }

  const result: InstagramPost = {
    id: post.id,
    posted_by: post.posted_by,
    caption: post.caption,
    timestamp: post.timestamp,
    images: post.images as string[] | null,
    club_name,
    club_avatar_url,
    club_profile_id: fetch?.profile_id ?? null,
  };

  return NextResponse.json(
    { post: result },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
