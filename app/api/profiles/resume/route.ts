import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { parseDocument } from "@/lib/parsers/documentParser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

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
  let fileName = "";

  try {
    if (contentType.includes("application/json")) {
      // JSON payload: { profileId, fileName?, text }
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
      profileId = body.profileId;
      resumeText = (body.text || "").trim();
      fileName = body.fileName || "uploaded_text";
      if (!profileId || !resumeText) {
        return NextResponse.json({ error: "Missing profileId or text" }, { status: 400 });
      }
    } else {
      // FormData file upload (resume)
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch (err) {
        console.error("Failed to parse form data:", err);
        return NextResponse.json({ error: "Invalid form submission" }, { status: 400 });
      }
      const file = formData.get("resume") as File;
      profileId = formData.get("profileId") as string;
      if (!file || !profileId) {
        return NextResponse.json({ error: "Missing file or profileId" }, { status: 400 });
      }

      const parseResult = await parseDocument(file);
      if (!parseResult.success) {
        return NextResponse.json({ success: false, error: parseResult.error || "Failed to parse resume" }, { status: 400 });
      }
      resumeText = parseResult.text || "";
      fileName = file.name;
    }

    // Ensure the profileId matches the authenticated user
    if (profileId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate Resume content with LLM
    const authHeader = req.headers.get("authorization") || "";

    const validateRes = await fetch(new URL("/api/validate/text", req.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") || "",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({
        text: resumeText,
        fullName: `${(user as any)?.first_name || ""} ${(user as any)?.last_name || ""}`.trim(),
      }),
    });
    if (!validateRes.ok) {
      const errText = await validateRes.text();
      return NextResponse.json({ success: false, error: "Validation failed", details: errText }, { status: 502 });
    }
    const validation = await validateRes.json();
    if (!validation.safe || !validation.relevant || !validation.belongsToUser || validation.templateResume) {
      return NextResponse.json({ success: false, validation }, { status: 400 });
    }

    // Call LLM to extract resume into profile chunks
    const chunkRes = await fetch(new URL("/api/onboarding/chunkText", req.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") || "",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ text: resumeText }),
    });
    if (!chunkRes.ok) {
      const errText = await chunkRes.text();
      return NextResponse.json({ success: false, error: "Chunking failed", details: errText }, { status: 502 });
    }
    const chunkData = await chunkRes.json();
    if (!chunkData.success || !Array.isArray(chunkData.chunks)) {
      return NextResponse.json({ success: false, error: "Invalid chunk response" }, { status: 502 });
    }
    const chunksFromLLM = chunkData.chunks as Array<{ category: string; content: string; chunk_id?: string }>;

    // Build categories and upsert category order
    const categories = Array.from(new Set(chunksFromLLM.map((c) => c.category)));
    const categoriesPayload = categories.map((c, i) => ({ profile_id: profileId, category: c, order: i }));

    // Delete categories not present anymore
    const { data: existingCategories } = await supabase
      .from("profile_chunk_categories")
      .select("category")
      .eq("profile_id", profileId);
    const existingCats = (existingCategories || []).map((c: any) => c.category);
    const toDeleteCategories = existingCats.filter((c: string) => !categories.includes(c));
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
      return NextResponse.json({ success: false, error: "Failed to save categories" }, { status: 500 });
    }

    // Prepare chunks (assign ids and order per category)
    const orderMap: Record<string, number> = {};
    categories.forEach((c) => (orderMap[c] = 0));
    const chunksToUpsert = chunksFromLLM.map((ch) => {
      const id = ch.chunk_id || crypto.randomUUID();
      const order = orderMap[ch.category]++;
      return { id, profile_id: profileId, text: ch.content, category: ch.category, order };
    });

    // Delete old chunks not present in new set
    const newIds = chunksToUpsert.map((c) => c.id);
    const { data: existingChunks } = await supabase
      .from("profile_chunks")
      .select("id")
      .eq("profile_id", profileId);
    const existingChunkIds = (existingChunks || []).map((c: any) => c.id);
    const toDeleteChunkIds = existingChunkIds.filter((id: string) => !newIds.includes(id));
    if (toDeleteChunkIds.length > 0) {
      const { error: delError } = await supabase
        .from("profile_chunks")
        .delete()
        .eq("profile_id", profileId)
        .in("id", toDeleteChunkIds);
      if (delError) console.error("Error deleting old chunks:", delError);
    }

    // Upsert chunks
    const { error: chunksError } = await supabase
      .from("profile_chunks")
      .upsert(
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
      return NextResponse.json({ success: false, error: "Failed to save chunks" }, { status: 500 });
    }

    // Trigger vector store upload (non-blocking)
    try {
      await fetch(new URL("/api/vector-store/uploadProfile", req.url).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.get("cookie") || "",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({ userId: profileId }),
      });
    } catch (err) {
      console.warn("Vector store upload failed (non-fatal):", err);
    }

    // Return saved chunks
    const { data: savedChunks } = await supabase
      .from("profile_chunks")
      .select("*")
      .eq("profile_id", profileId)
      .order("order", { ascending: true });

    return NextResponse.json({ success: true, chunks: savedChunks || [] }, { status: 200 });
  } catch (err) {
    console.error("Error processing resume:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
