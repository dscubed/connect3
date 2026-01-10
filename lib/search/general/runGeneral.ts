import OpenAI from "openai";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";

import { planGeneral } from "./planGeneral";
import { normalizeUniversitySlug } from "./uniSlug";
import { getUniversityVectorStoreId } from "./universities";
import { runUniversityGeneral } from "./runUniversityGeneral";
import { runConnect3General } from "./runConnect3General";

import { dbg, mkTraceId, preview } from "./debug";

type RunGeneralArgs = {
  openai: OpenAI;
  query: string;
  tldr: string;
  prevMessages: ResponseInput;

  /**
   * Optional: user's university from DB/profile
   * (can be human-readable or slug)
   */
  userUniversity?: string | null;

  emit?: (event: string, data: unknown) => void;
};

export async function runGeneral({
  openai,
  query,
  tldr,
  prevMessages,
  userUniversity = null,
  emit,
}: RunGeneralArgs): Promise<string> {
  const traceId = `general_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2)}`;

  // 1) Decide if uni-related
  const plan = await planGeneral(openai, query, tldr, prevMessages);
  emit?.("debug", { traceId, stage: "planGeneral", plan });

  // 2) Not uni-related → Connect3 general chatbot
  if (!plan.uniRelated) {
    emit?.("debug", {
      traceId,
      stage: "route",
      route: "connect3_general",
    });

    return runConnect3General(openai, query, prevMessages);
  }

  // 3) Resolve university
  const rawUni = plan.university ?? userUniversity;
  const uniSlug = normalizeUniversitySlug(rawUni);
  const vectorStoreId = getUniversityVectorStoreId(uniSlug);

  emit?.("debug", {
    traceId,
    stage: "uniResolution",
    rawUni,
    uniSlug,
    vectorStoreIdExists: Boolean(vectorStoreId),
  });

  // 4) Uni-related + vector store exists → hit vector store (with web fallback inside)
  if (uniSlug && vectorStoreId) {
    emit?.("debug", {
      traceId,
      stage: "route",
      route: "uni_vector_store",
      uniSlug,
    });

    return runUniversityGeneral(openai, query, uniSlug, vectorStoreId, {
      traceId,
      emit,
    });
  }

  // 5) Uni-related but no vector store → direct web search
  emit?.("debug", {
    traceId,
    stage: "route",
    route: "web_only_fallback",
    reason: !uniSlug
      ? "unknown_university"
      : "no_vector_store_for_university",
  });

  const resp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "You are a university help assistant. The university knowledge base is unavailable. Use web search and prefer official university or government sources.",
      },
      { role: "user", content: query },
    ],
    tools: [{ type: "web_search_preview" as any }],
  });

  const text = (resp.output_text ?? "").trim();
  emit?.("debug", { traceId, stage: "final_text_len", len: text.length });
  return text;

  return (resp.output_text ?? "").trim();
}
