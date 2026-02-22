import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { processResume } from "@/lib/resume/processResume";
import { extractResumeProfileDetails } from "@/lib/resume/extractProfileDetails";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const user = authResult.user;
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  // Accept either JSON text body (application/json) or FormData file upload
  const contentType = (req.headers.get("content-type") || "").toLowerCase();
  let profileId: string | undefined;
  let resumeText = "";

  try {
    if (contentType.includes("application/json")) {
      // JSON payload: { profileId, text }
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") {
        return NextResponse.json(
          { error: "Invalid JSON body" },
          { status: 400 },
        );
      }
      profileId = body.profileId;
      resumeText = (body.text || "").trim();
      if (!profileId || !resumeText) {
        return NextResponse.json(
          { error: "Missing profileId or text" },
          { status: 400 },
        );
      }
    }

    // Ensure the profileId matches the authenticated user
    if (profileId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get existing chunks for comparison
    const { data: existingChunksData, error: fetchError } = await supabase
      .from("profile_chunks")
      .select("id, text, category, order")
      .eq("profile_id", profileId)
      .order("order", { ascending: true });

    if (fetchError) {
      console.error("Error fetching existing chunks:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch existing chunks" },
        { status: 500 },
      );
    }

    // Process resume using new processResume function
    // This will sanitize, validate, and chunk the resume
    const chunkResult = await processResume(
      resumeText,
      profileId,
      existingChunksData || [],
      openai,
    );

    if (!chunkResult) {
      throw new Error("Error processing resume");
    }

    // Extract profile details for preview (tldr, university, links); user applies in UI
    let profileDetails = null;
    try {
      profileDetails = await extractResumeProfileDetails(resumeText, openai);
    } catch (extractError) {
      console.error(
        "Error extracting profile details from resume:",
        extractError
      );
    }

    return NextResponse.json(
      { success: true, result: { ...chunkResult, profileDetails } },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error processing resume:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal error",
      },
      { status: 500 },
    );
  }
}
