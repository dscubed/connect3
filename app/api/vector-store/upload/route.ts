import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { uploadToVectorStoreAndDatabase } from "@/lib/vector-store/vectorStoreUtils";
import { semanticChunkText } from "@/lib/vector-store/semanticChunking";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user via Supabase Auth
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;

    // 2. Parse request body

    const { userId, summaryText } = await req.json();
    // Verify the authenticated user matches the userId in request
    if (user.id !== userId) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    if (!userId || !summaryText) {
      return NextResponse.json(
        {
          error: "Missing required fields: userId, summaryText",
        },
        { status: 400 }
      );
    }

    const chunks = await semanticChunkText(summaryText);
    const uploadResults = [];

    for (const chunk of chunks) {
      const result = await uploadToVectorStoreAndDatabase(
        userId,
        chunk.content
      );
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            uploadedChunks: uploadResults.length,
          },
          { status: 500 }
        );
      }
      uploadResults.push(result);
    }

    return NextResponse.json({
      success: true,
      totalChunks: uploadResults.length,
      firstFileId: uploadResults[0]?.uploadedFileId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
