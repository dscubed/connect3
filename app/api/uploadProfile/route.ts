import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId, summaryText, vectorStoreId } = await req.json();

    if (!userId || !summaryText || !vectorStoreId) {
      return NextResponse.json(
        {
          error: "Missing required fields: userId, summaryText, vectorStoreId",
        },
        { status: 400 }
      );
    }

    // ✅ BEST PRACTICE: Two-step process for reliability
    // Step 1: Create the file first (gives us immediate file ID)
    const file = await client.files.create({
      file: new Blob([summaryText], { type: "text/plain" }),
      purpose: "assistants",
    });

    console.log("Created file:", file.id);

    // Step 2: Add the existing file to vector store
    const vectorStoreFile = await client.vectorStores.files.createAndPoll(
      vectorStoreId,
      {
        file_id: file.id, // Use the file we just created
      }
    );

    // Check if the file was successfully added to vector store
    if (vectorStoreFile.status === "failed") {
      throw new Error(
        `Failed to add file to vector store: ${
          vectorStoreFile.last_error?.message || "Unknown error"
        }`
      );
    }

    return NextResponse.json({
      success: true,
      vectorStoreId,
      uploadedFileId: file.id,
      vectorStoreFile: {
        id: vectorStoreFile.id,
        status: vectorStoreFile.status,
        usage_bytes: vectorStoreFile.usage_bytes,
      },
    });
  } catch (err: unknown) {
    console.error("Vector store upload error:", err);
    const errorMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
