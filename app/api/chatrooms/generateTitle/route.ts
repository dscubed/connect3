import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { chatroomId, firstMessage } = await req.json();

    if (!chatroomId || !firstMessage) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate a short, clear chatroom title (max 6 words). No quotes.",
        },
        {
          role: "user",
          content: firstMessage,
        },
      ],
    });

    const title = completion.choices[0]?.message?.content?.trim();
    if (!title) {
      return NextResponse.json({ ok: true });
    }

    await supabase
      .from("chatrooms")
      .update({ title })
      .eq("id", chatroomId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("generateTitle error", err);
    return NextResponse.json({ ok: true });
  }
}
