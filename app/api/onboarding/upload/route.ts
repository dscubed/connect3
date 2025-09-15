import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const { chunkedData } = await req.json();

    if (!chunkedData || chunkedData.userId !== user.id) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // This runs on the server - won't stop if user leaves
    const uploadResults = [];

    for (let i = 0; i < chunkedData.chunks.length; i++) {
      const chunk = chunkedData.chunks[i];

      console.log(`Uploading chunk ${i + 1}/${chunkedData.chunks.length}...`);

      const uploadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/vector-store/uploadChunk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.get("authorization") || "",
          },
          body: JSON.stringify({
            userId: chunkedData.userId,
            text: chunk.content,
          }),
        }
      );

      if (!uploadResponse.ok) {
        console.error(`Failed to upload chunk ${i + 1}`);
        continue; // Continue with other chunks
      }

      const uploadResult = await uploadResponse.json();
      if (uploadResult.success) {
        uploadResults.push(uploadResult);
      }
    }

    return NextResponse.json({
      success: true,
      uploadedChunks: uploadResults.length,
      totalChunks: chunkedData.chunks.length,
    });
  } catch (error) {
    console.error("Background upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
