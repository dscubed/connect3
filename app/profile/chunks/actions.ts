"use server";

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { validateChunkText } from "@/lib/resume/validateChunk";

export type ValidateChunksInput = { id: string; text: string }[];

export type ValidateChunksResult =
  | { success: true }
  | { success: false; errors: { chunkId: string; reason: string }[] };

/**
 * Validates all chunks (safe + not sensitive). Call before saving chunks.
 * Returns success: false with errors if any chunk fails validation.
 */
export async function validateChunksAction(
  chunks: ValidateChunksInput
): Promise<ValidateChunksResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      errors: [{ chunkId: "", reason: "You must be signed in to save." }],
    };
  }

  const toValidate = chunks.filter((c) => c.text.trim().length > 0);
  if (toValidate.length === 0) {
    return { success: true };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const results = await Promise.all(
    toValidate.map(async (chunk) => {
      const result = await validateChunkText(chunk.text, openai);
      return { chunkId: chunk.id, ...result };
    })
  );

  const errors = results.filter(
    (r) => !r.safe || r.sensitive
  ).map((r) => ({ chunkId: r.chunkId, reason: r.reason }));

  if (errors.length > 0) {
    return { success: false, errors };
  }
  return { success: true };
}
