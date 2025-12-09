import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { runSearch } from "@/lib/search/agent";
import { generateResponse } from "@/lib/search/response";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export type SSEEmitter = (type: string, data: unknown) => Promise<void>;

export async function POST(req: NextRequest) {
  const { messageId } = await req.json();

  if (!messageId) {
    return NextResponse.json(
      { success: false, error: "Missing messageId" },
      { status: 400 }
    );
  }

  // Check if message exists and is pending
  const { data: messageData, error: messageError } = await supabase
    .from("chatmessages")
    .select("id, status")
    .eq("id", messageId)
    .eq("status", "pending")
    .single();

  if (messageError || !messageData) {
    console.error("Message fetch error:", messageError);
    return NextResponse.json(
      { success: false, error: "Message not found or not pending" },
      { status: 404 }
    );
  }

  const channel = supabase.channel(`message:${messageId}`);
  console.log("Creating channel for message ID:", channel.state);

  const emit: SSEEmitter = async (type, data) => {
    // console.log("Emitting event:", type, data);
    await channel.send({
      type: "broadcast",
      event: type,
      payload: data,
    });
  };

  try {
    await emit("status", { step: "started", message: "Starting search..." });
    const { error: processingUpdateError } = await supabase
      .from("chatmessages")
      .update({ status: "processing" })
      .eq("id", messageId);
    if (processingUpdateError) {
      console.error("Failed to update message status:", processingUpdateError);
      throw new Error("Failed to update message status");
    }

    const { query, state } = await runSearch(messageId, openai, supabase, emit);
    const response = await generateResponse(query, state, openai, emit);

    await emit("done", {
      success: true,
      response,
    });

    const { error: completeUpdateError } = await supabase
      .from("chatmessages")
      .update({
        status: "completed",
        content: response,
      })
      .eq("id", messageId);

    if (completeUpdateError) {
      console.error("Failed to update message status:", completeUpdateError);
      throw new Error("Failed to update message status");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Run search error:", error);
    await emit("error", { message: String(error) });
    await supabase
      .from("chatmessages")
      .update({ status: "failed" })
      .eq("id", messageId);

    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
