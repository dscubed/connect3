import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export const config = {
  runtime: "edge",
};

export async function POST(request: NextRequest) {
  try {
    // Authenticate user via Supabase Auth
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;
    const { userId } = await request.json();

    // Validate input
    if (!userId || !user) {
      return NextResponse.json(
        { error: "userId, or authentication required" },
        { status: 400 },
      );
    }

    if (user.id !== userId) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    // Dedupe: remove any existing pending jobs for this user
    await supabase
      .from("profile_upload_jobs")
      .delete()
      .eq("user_id", userId)
      .eq("status", "pending");

    // Enqueue a new upload job
    const { error: insertError } = await supabase
      .from("profile_upload_jobs")
      .insert({ user_id: userId, status: "pending" });

    if (insertError) {
      console.error("Error enqueuing profile upload job:", insertError);
      return NextResponse.json(
        { error: "Failed to enqueue profile upload" },
        { status: 500 },
      );
    }

    // Return 202 Accepted — the worker will process this asynchronously
    return NextResponse.json(
      { message: "Profile upload enqueued" },
      { status: 202 },
    );
  } catch (error) {
    console.error("❌ Error in uploadProfile route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
