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

export type SSEEmitter = (type: string, data: Record<string, unknown>) => void;

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const { messageId } = await req.json();

  if (!messageId) {
    return NextResponse.json(
      { success: false, error: "Missing messageId" },
      { status: 400 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const emit: SSEEmitter = (type, data) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`)
        );
      };

      try {
        emit("status", { step: "started", message: "Starting search..." });
        const { error: processingUpdateError } = await supabase
          .from("chatmessages")
          .update({ status: "processing" })
          .eq("id", messageId);
        if (processingUpdateError) {
          console.error(
            "Failed to update message status:",
            processingUpdateError
          );
        }

        const { query, state } = await runSearch(
          messageId,
          openai,
          supabase,
          emit
        );
        const response = await generateResponse(query, state, openai, emit);

        emit("done", {
          success: true,
          contextSummary: state.summary,
          query,
          entities: state.entities,
          invalidEntities: state.invalidEntities,
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
          console.error(
            "Failed to update message status:",
            completeUpdateError
          );
        }
      } catch (error) {
        console.error("Run search error:", error);
        emit("error", { message: String(error) });
        supabase
          .from("chatmessages")
          .update({ status: "failed" })
          .eq("id", messageId);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
