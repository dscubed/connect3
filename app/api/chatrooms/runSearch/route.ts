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

  const { messageId } = await req.json();
  console.log(`[runSearchRoute] incoming`, { messageId, userId: user.id });

  if (!messageId) {
    return NextResponse.json(
      { success: false, error: "Missing messageId" },
      { status: 400 },
    );
  }

  // Check if message exists and is pending
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

  channel.subscribe((status, err) => {
    console.log(`[runSearchRoute] channel_status`, {
      messageId,
      channelName,
      status,
      err,
    });
  });
  console.log(`[runSearchRoute] channel_created`, {
    messageId,
    channelName,
    state: channel.state,
  });

  const emit: SSEEmitter = async (type, data) => {
    const dataPreview =
      typeof data === "string"
        ? data.slice(0, 160)
        : JSON.stringify(data).slice(0, 240);

    if (type !== "response") {
      console.log(`[runSearchRoute] emit_attempt`, {
        messageId,
        type,
        channelState: channel.state,
        dataPreview,
      });
    }

    const res = await channel.send({
      type: "broadcast",
      event: type,
      payload: data,
    });

    if (type !== "response") {
      console.log(`[runSearchRoute] emit_result`, { messageId, type, res });
    }

    // If send failed, surface it
    if (res !== "ok") {
      console.error(`[runSearchRoute] emit_error`, {
        messageId,
        type,
        error: res,
      });
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

    const response = await runSearch(messageId, openai, supabase, emit);
    console.log(`[runSearchRoute] response_ready`, {
      messageId,
      markdownLen: response.markdown?.length ?? 0,
      markdownPreview: response.markdown?.slice(0, 120),
    });

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

    return NextResponse.json({
      success: true,
      response,
      debug: {
        messageId,
        note: "If realtime misses 'done', use this HTTP response.",
      },
    });
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
