import OpenAI from "openai";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";

import { planGeneral } from "./planGeneral";
import { normalizeUniversitySlug } from "./uniSlug";
import { getUniversityVectorStoreId } from "./universities";
import { runUniversityGeneral } from "./runUniversityGeneral";
import { runConnect3General } from "./runConnect3General";
import { countWebSearchCalls } from "./countWebSearches";

type RunGeneralArgs = {
  openai: OpenAI;
  query: string;
  tldr: string;
  prevMessages: ResponseInput;
  userUniversity?: string | null;
  emit?: (event: string, data: unknown) => void;
};

export async function runGeneral({
  openai,
  query,
  tldr,
  prevMessages,
  userUniversity,
  emit,
}: RunGeneralArgs): Promise<string> {
  const traceId = `general_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2)}`;

  const plan = await planGeneral(openai, query, tldr, prevMessages);

  console.log("[runGeneral] planGeneral", {
    traceId,
    plan,
  });

  if (!plan.uniRelated) {
    console.log("[runGeneral] route", {
      traceId,
      route: "connect3_general",
    });

    return runConnect3General(openai, query, prevMessages);
  }

  const plannedUni =
  plan.university && plan.university.trim() !== ""
    ? plan.university
    : null;
  const rawUni = plannedUni ?? userUniversity;
  const uniSlug = normalizeUniversitySlug(rawUni);
  const vectorStoreId = getUniversityVectorStoreId(uniSlug);

  console.log("[runGeneral] uniResolution", {
    traceId,
    rawUni,
    uniSlug,
    vectorStoreIdExists: Boolean(vectorStoreId),
  });

  if (uniSlug && vectorStoreId) {
    console.log("[runGeneral] route", {
      traceId,
      route: "uni_vector_store",
      uniSlug,
    });

    return runUniversityGeneral(openai, query, uniSlug, vectorStoreId, {
      traceId,
      emit,
    });
  }

  console.log("[runGeneral] route", {
    traceId,
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

  emit?.(
    "progress",
    `WEB SEARCH usage: calls=${countWebSearchCalls(resp)} tokens=${resp.usage?.total_tokens}`
  );

  console.log("[runGeneral] web_search_usage", {
    traceId,
    webCalls: countWebSearchCalls(resp),
    inputTokens: resp.usage?.input_tokens,
    outputTokens: resp.usage?.output_tokens,
    totalTokens: resp.usage?.total_tokens,
  });

  const text = (resp.output_text ?? "").trim();

  console.log("[runGeneral] final_text_len", {
    traceId,
    len: text.length,
  });

  return text;
}
