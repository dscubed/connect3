import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chunkId: string }> }
) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Await params before accessing properties
    const { chunkId } = await params;

    if (!chunkId) {
      return NextResponse.json(
        { error: "Chunk ID is required" },
        { status: 400 }
      );
    }

    // Get the chunk from database to get the OpenAI file ID
    const { data: chunk, error: fetchError } = await supabase
      .from("user_files")
      .select("openai_file_id, user_id")
      .eq("id", chunkId)
      .single();

    if (fetchError || !chunk) {
      return NextResponse.json({ error: "Chunk not found" }, { status: 404 });
    }

    if (chunk.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this chunk" },
        { status: 403 }
      );
    }

    // Delete from OpenAI Vector Store
    try {
      const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
      if (vectorStoreId && chunk.openai_file_id) {
        // Remove from vector store
        await openai.vectorStores.files.delete(chunk.openai_file_id, {
          vector_store_id: vectorStoreId,
        });

        // Delete the file from OpenAI
        await openai.files.delete(chunk.openai_file_id);
      }
    } catch (openaiError) {
      console.error("Error deleting from OpenAI:", openaiError);
      // Continue with database deletion even if OpenAI deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("user_files")
      .delete()
      .eq("id", chunkId);

    if (deleteError) {
      throw new Error(`Database deletion failed: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Chunk deleted successfully",
    });
  } catch (error) {
    console.error("Delete process error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
