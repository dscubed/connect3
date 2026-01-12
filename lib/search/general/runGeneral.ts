// src/lib/search/general/runGeneral.ts
import OpenAI from "openai";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";

import { planGeneral } from "./planGeneral";
import { normalizeUniversitySlug } from "./uniSlug";
import { getUniversityVectorStoreId } from "./universities";
import { runUniversityGeneral } from "./runUniversityGeneral";
import { runConnect3General } from "./runConnect3General";
import { countWebSearchCalls } from "./countWebSearches";
import { normalisedPlannedUni } from "./normalisedPlannedUni";

export type SearchResponse = {
  summary: string;
  results: any[];
  followUps: string;
};

type RunGeneralArgs = {
  openai: OpenAI;
  query: string;
  tldr: string;
  prevMessages: ResponseInput;
  userUniversity?: string | null;
  emit?: (event: string, data: unknown) => void;
};

// ---------- heuristics (unchanged logic) ----------
function detectUniversityFromQuery(query: string): string | null {
  const q = query.toLowerCase();
  if (/\bunimelb\b|\buniversity of melbourne\b|\bmelbourne uni\b/.test(q))
    return "University of Melbourne";
  if (/\bmonash\b|\bmonash university\b/.test(q)) return "Monash University";
  if (/\buwa\b|\buniversity of western australia\b/.test(q))
    return "University of Western Australia";
  if (/\brmit\b|\brmit university\b/.test(q)) return "RMIT University";
  return null;
}

function looksUniRelated(query: string): boolean {
  const q = query.toLowerCase();

  const uniKeywords =
    /(unimelb|university|campus|handbook|subject|timetable|enrol|enroll|census|wam|scholarship|degree|course|major|minor|faculty|parkville|umsu|student union|stop 1|advocacy|graduation|exam)/;

  const clubsAndUniContext =
    /(club|clubs|society|societies|organisation|organizations|orgs|events)/.test(q) &&
    /(unimelb|monash|rmit|nus|university|campus|student union|umsu|guild|union)/.test(q);

  const hasSubjectCode = /\b[a-z]{3,4}\d{4,5}\b/i.test(query);

  return uniKeywords.test(q) || clubsAndUniContext || hasSubjectCode;
}

function looksConnect3Related(query: string): boolean {
  return /(connect3|connect 3|my profile|matches|matchmaking|in-app|in app|onboarding|how do i use)/i.test(
    query
  );
}

function heuristicPlan(query: string, userUniversity?: string | null) {
  if (looksUniRelated(query)) {
    const uniFromQuery = detectUniversityFromQuery(query);
    return {
      uniRelated: true,
      university: uniFromQuery ?? userUniversity ?? null,
      reason: "heuristic: uni_related",
    };
  }

  if (looksConnect3Related(query)) {
    return {
      uniRelated: false,
      university: null,
      reason: "heuristic: connect3_related",
    };
  }

  return null;
}

// ---------- main ----------
export async function runGeneral({
  openai,
  query,
  tldr,
  prevMessages,
  userUniversity,
  emit,
}: RunGeneralArgs): Promise<SearchResponse> {
  const traceId = `general_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const heuristic = heuristicPlan(query, userUniversity);
  const plan =
    heuristic ??
    (await planGeneral(openai, query, prevMessages, emit, traceId));

  console.log("[runGeneral] plan", { traceId, plan, fromHeuristic: !!heuristic });

  // -------- non-uni → Connect3 --------
  if (!plan.uniRelated) {
    const text = await runConnect3General(openai, query, prevMessages);
    return {
      summary: text,
      results: [],
      followUps: "",
    };
  }

  // -------- resolve university (fallback to userUniversity) --------
  const plannedUni = normalisedPlannedUni(plan.university);

  const rawUni = plannedUni ?? (userUniversity ?? null);
  const uniSlug = normalizeUniversitySlug(rawUni);
  const vectorStoreId = getUniversityVectorStoreId(uniSlug);

  console.log("[runGeneral] uniResolution", {
    traceId,
    rawUni,
    uniSlug,
    vectorStoreIdExists: Boolean(vectorStoreId),
  });

  // -------- KB path --------
  if (uniSlug && vectorStoreId) {
    return runUniversityGeneral(openai, query, uniSlug, vectorStoreId, {
      traceId,
      emit,
    });
  }

  // -------- web fallback --------
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

  return {
    summary: (resp.output_text ?? "").trim(),
    results: [],
    followUps: "",
  };
}