import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { runSearch } from "@/lib/search/agent";
import { authenticateRequest } from "@/lib/api/auth-middleware";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export type SSEEmitter = (type: string, data: unknown) => Promise<void>;

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const user = authResult.user;
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { messageId, universities: selectedUniversities } = await req.json();

  if (!messageId) {
    return NextResponse.json(
      { success: false, error: "Missing messageId" },
      { status: 400 },
    );
  }

  const { data: messageData, error: messageError } = await supabase
    .from("chatmessages")
    .select("id, status")
    .eq("id", messageId)
    .eq("status", "pending")
    .eq("user_id", user.id)
    .single();

  if (messageError || !messageData) {
    console.error("Message fetch error:", messageError);
    return NextResponse.json(
      {
        success: false,
        error: "Message not found or not pending or unauthorized",
      },
      { status: 404 },
    );
  }

  const channelName = `message:${messageId}`;
  const channel = supabase.channel(channelName);

  channel.subscribe();

  const emit: SSEEmitter = async (type, data) => {
    const res = await channel.send({
      type: "broadcast",
      event: type,
      payload: data,
    });

    if (res !== "ok") {
      console.error(`[runSearchRoute] emit failed`, { messageId, type, res });
    }
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

    const response = await runSearch(messageId, openai, supabase, emit, selectedUniversities);

    await emit("done", {
      success: true,
      result: response,
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

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error("Run search error:", error);
    await emit("error", { message: String(error) });
    await supabase
      .from("chatmessages")
      .update({ status: "failed" })
      .eq("id", messageId);

    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
