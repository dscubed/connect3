import { NextResponse } from "next/server";
import { uploadToVectorStoreAndDatabase } from "@/lib/vector-store/vectorStoreUtils";

export async function POST(req: Request) {
  try {
    const { userId, summaryText } = await req.json();

    if (!userId || !summaryText) {
      return NextResponse.json(
        {
          error: "Missing required fields: userId, summaryText",
        },
        { status: 400 }
      );
    }

    // Use the utils function to handle both vector store and database
    const result = await uploadToVectorStoreAndDatabase(userId, summaryText);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("API route error:", err);
    const errorMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
