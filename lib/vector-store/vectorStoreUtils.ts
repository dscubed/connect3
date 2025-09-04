import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface UploadResult {
  success: boolean;
  uploadedFileId: string;
  supabaseRecordId?: string;
  error?: string;
}

export async function uploadToVectorStoreAndDatabase(
  userId: string,
  summaryText: string
): Promise<UploadResult> {
  try {
    // Get vector store ID from environment variables
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

    if (!vectorStoreId) {
      throw new Error(
        "Vector Store ID not configured in environment variables"
      );
    }

    // Step 1: Upload to OpenAI Vector Store
    console.log("Uploading to vector store...");

    const fileObj = new File([summaryText], `${userId}_${Date.now()}.txt`, {
      type: "text/plain",
    });
    const file = await openai.files.create({
      file: fileObj,
      purpose: "assistants",
    });

    const vectorStoreFile = await openai.vectorStores.files.createAndPoll(
      vectorStoreId,
      {
        file_id: file.id,
      }
    );

    if (vectorStoreFile.status === "failed") {
      throw new Error(
        `Failed to add file to vector store: ${
          vectorStoreFile.last_error?.message || "Unknown error"
        }`
      );
    }

    const { data, error } = await supabase
      .from("user_files")
      .insert({
        user_id: userId,
        openai_file_id: file.id,
        summary_text: summaryText,
        status: "completed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      uploadedFileId: file.id,
      supabaseRecordId: data.id,
    };
  } catch (error) {
    console.error("Upload process error:", error);
    return {
      success: false,
      uploadedFileId: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
