import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const messageId = params.messageId;

    const { data: message, error } = await supabase
      .from("chatmessages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (error || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("❌ Error fetching message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
