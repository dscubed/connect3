import { NextRequest, NextResponse } from "next/server";
import { getFileText } from "@/lib/users/getFileText";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  console.log("Received GET /api/test/getChunks with id:", id);
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const textData = await getFileText(id, supabase);
    const text =
      textData.profile + "\n" + textData.links + "\n" + textData.chunks;

    return NextResponse.json({ data: text }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/test/getChunks:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
