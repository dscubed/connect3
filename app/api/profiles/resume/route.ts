import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { processResume } from "@/lib/resume/processResume";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
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
      { status: 401 }
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
          { status: 400 }
        );
      }
      profileId = body.profileId;
      resumeText = (body.text || "").trim();
      if (!profileId || !resumeText) {
        return NextResponse.json(
          { error: "Missing profileId or text" },
          { status: 400 }
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
      .select("id, text, category")
      .eq("profile_id", profileId)
      .order("order", { ascending: true });

    if (fetchError) {
      console.error("Error fetching existing chunks:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch existing chunks" },
        { status: 500 }
      );
    }

    // Format existing chunks as text array for processResume
    const chunkTexts =
      existingChunksData?.map((chunk) => chunk.text) || [];

    // Process resume using new processResume function
    // This will sanitize, validate, and chunk the resume
    const chunkResult = await processResume(
      resumeText,
      profileId,
      chunkTexts,
      openai
    );

    // Combine updated and new chunks
    const allChunks = [
      ...chunkResult.updatedChunks,
      ...chunkResult.newChunks.map((chunk) => ({
        id: crypto.randomUUID(),
        category: chunk.category,
        text: chunk.text,
      })),
    ];

    // Build categories and upsert category order
    const categories = Array.from(
      new Set(allChunks.map((c) => c.category))
    );
    const categoriesPayload = categories.map((c, i) => ({
      profile_id: profileId,
      category: c,
      order: i,
    }));

    // Delete categories not present anymore
    const { data: existingCategories } = await supabase
      .from("profile_chunk_categories")
      .select("category")
      .eq("profile_id", profileId);
    const existingCats = (existingCategories || []).map((c: any) => c.category);
    const toDeleteCategories = existingCats.filter(
      (c: string) => !categories.includes(c)
    );
    if (toDeleteCategories.length > 0) {
      await supabase
        .from("profile_chunk_categories")
        .delete()
        .eq("profile_id", profileId)
        .in("category", toDeleteCategories);
    }

    const { error: catError } = await supabase
      .from("profile_chunk_categories")
      .upsert(categoriesPayload, { onConflict: "profile_id, category" });
    if (catError) {
      console.error("Error upserting categories:", catError);
      return NextResponse.json(
        { success: false, error: "Failed to save categories" },
        { status: 500 }
      );
    }

    // Prepare chunks (assign ids and order per category)
    const orderMap: Record<string, number> = {};
    categories.forEach((c) => (orderMap[c] = 0));
    const chunksToUpsert = allChunks.map((ch) => {
      const order = orderMap[ch.category]++;
      return {
        id: ch.id,
        profile_id: profileId,
        text: ch.text,
        category: ch.category,
        order,
      };
    });

    // Delete old chunks not present in new set
    const newIds = chunksToUpsert.map((c) => c.id);
    const existingChunkIds = (existingChunksData || []).map((c: any) => c.id);
    const toDeleteChunkIds = existingChunkIds.filter(
      (id: string) => !newIds.includes(id)
    );
    if (toDeleteChunkIds.length > 0) {
      const { error: delError } = await supabase
        .from("profile_chunks")
        .delete()
        .eq("profile_id", profileId)
        .in("id", toDeleteChunkIds);
      if (delError) console.error("Error deleting old chunks:", delError);
    }

    // Upsert chunks
    const { error: chunksError } = await supabase.from("profile_chunks").upsert(
      chunksToUpsert.map((c) => ({
        id: c.id,
        profile_id: c.profile_id,
        text: c.text,
        category: c.category,
        order: c.order,
      })),
      { onConflict: "id" }
    );
    if (chunksError) {
      console.error("Error saving chunks:", chunksError);
      return NextResponse.json(
        { success: false, error: "Failed to save chunks" },
        { status: 500 }
      );
    }

    // Trigger vector store upload (non-blocking)
    const authHeader = req.headers.get("authorization") || "";
    try {
      await fetch(
        new URL("/api/vector-store/uploadProfile", req.url).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: req.headers.get("cookie") || "",
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify({ userId: profileId }),
        }
      );
    } catch (err) {
      console.warn("Vector store upload failed (non-fatal):", err);
    }

    // Return saved chunks
    const { data: savedChunks } = await supabase
      .from("profile_chunks")
      .select("*")
      .eq("profile_id", profileId)
      .order("order", { ascending: true });

    return NextResponse.json(
      { success: true, chunks: savedChunks || [] },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error processing resume:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
