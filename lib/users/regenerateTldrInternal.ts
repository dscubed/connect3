import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function regenerateTldrInternal(userId: string) {
  const { data: chunks, error } = await supabase
    .from("user_files")
    .select("summary_text")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chunks for internal TLDR:", error);
    return;
  }

  if (!chunks || chunks.length === 0) {
    await supabase
      .from("profiles")
      .update({ tldr_internal: null })
      .eq("id", userId);
    return;
  }

  const summaries = chunks
    .map((c, i) => `Chunk ${i + 1}: ${c.summary_text}`)
    .join("\n");

  const systemPrompt = `
Summarise the following profile chunks into a concise internal TLDR.
This is ONLY for AI personalisation, never shown to the user.

Rules:
- 3-5 sentences max
- Factual, neutral, CV-style
- Must cover degree, key tech domains, standout projects, and any awards
- No fluff, no praise words (e.g., "exceptional", "impressive")
- Do NOT mention how this summary was generated
- Output ONLY plain text
`;

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: summaries },
    ],
  });

  const tldrInternal = response.output_text?.trim() ?? "";

  await supabase
    .from("profiles")
    .update({ tldr_internal: tldrInternal })
    .eq("id", userId);
}
