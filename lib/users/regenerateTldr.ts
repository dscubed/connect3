import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function regenerateTldr(userId: string) {
  const { data: chunks } = await supabase
    .from("user_files")
    .select("summary_text")
    .eq("user_id", userId)
    .eq("status", "completed");

  if (!chunks) return;

  const formatted = chunks.map(c => `- ${c.summary_text}`).join("\n");

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: "Write a 2 sentence summary of this student's experience. No emojis."
      },
      { role: "user", content: formatted }
    ]
  });

  const tldr = response.output_text?.trim() ?? "";

  await supabase.from("profiles").update({ tldr }).eq("id", userId);
}
