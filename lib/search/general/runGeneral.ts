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
  prevMessages: ResponseInput; // will be [] from agents.ts for speed
  userUniversity?: string | null;
  emit?: (event: string, data: unknown) => void;
};

// --- Heuristic routing helpers (fast & safe) ---
// Goal: avoid misrouting things like "what tech clubs at unimelb" to connect3_general.
function detectUniversityFromQuery(query: string): string | null {
  const q = query.toLowerCase();

  // Expand as needed (keep conservative)
  if (/\bunimelb\b|\buniversity of melbourne\b|\bmelbourne uni\b/.test(q))
    return "University of Melbourne";
  if (/\bmonash\b|\bmonash university\b/.test(q)) return "Monash University";
  if (/\bnus\b|\bnational university of singapore\b/.test(q))
    return "National University of Singapore";
  if (/\brmit\b|\brmit university\b/.test(q)) return "RMIT University";

  return null;
}

function looksUniRelated(query: string): boolean {
  const q = query.toLowerCase();

  // Uni keywords (clubs at unimelb MUST match here)
  const uniKeywords =
    /(unimelb|university|campus|handbook|subject|timetable|enrol|enroll|census|wam|scholarship|degree|course|major|minor|faculty|parkville|umsu|student union|stop 1|advocacy|graduation|exam)/;

  // Important: "clubs" only becomes uni-related if paired with a uni marker OR uni context words
  const clubsAndUniContext =
    /(club|clubs|society|societies|organisation|organizations|orgs|events)/.test(q) &&
    /(unimelb|monash|rmit|nus|university|campus|student union|umsu|guild|union)/.test(q);

  const hasSubjectCode = /\b[a-z]{3,4}\d{4,5}\b/i.test(query); // e.g., COMP20008
  return uniKeywords.test(q) || clubsAndUniContext || hasSubjectCode;
}

function looksConnect3Related(query: string): boolean {
  const q = query.toLowerCase();
  return /(connect3|connect 3|my profile|matches|matchmaking|in-app|in app|onboarding|how do i use)/.test(q);
}

function heuristicPlan(query: string, userUniversity?: string | null) {
  // Prioritize uni routing if it looks uni-related (prevents "clubs at unimelb" -> connect3)
  if (looksUniRelated(query)) {
    const uniFromQuery = detectUniversityFromQuery(query);
    return {
      uniRelated: true,
      university: uniFromQuery ?? (userUniversity ?? null),
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

  return null; // fall back to planGeneral
}

export async function runGeneral({
  openai,
  query,
  tldr,
  prevMessages,
  userUniversity,
  emit,
}: RunGeneralArgs): Promise<string> {
  const traceId = `general_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  // ✅ NEW: heuristic first (fast, prevents misroutes)
  const heuristic = heuristicPlan(query, userUniversity);
  const plan =
    heuristic ??
    (await planGeneral(openai, query, prevMessages, emit, traceId));

  console.log("[runGeneral] plan", {
    traceId,
    plan,
    fromHeuristic: Boolean(heuristic),
  });

  // Non-uni related => Connect3 general (no tools)
  if (!plan.uniRelated) {
    console.log("[runGeneral] route", {
      traceId,
      route: "connect3_general",
    });

    // prevMessages is already [] (fast path). Keep signature unchanged.
    return runConnect3General(openai, query, prevMessages);
  }

  const plannedUni =
    plan.university && plan.university.trim() !== "" ? plan.university : null;
  const rawUni = plannedUni ?? userUniversity;
  const uniSlug = normalizeUniversitySlug(rawUni);
  const vectorStoreId = getUniversityVectorStoreId(uniSlug);

  console.log("[runGeneral] uniResolution", {
    traceId,
    rawUni,
    uniSlug,
    vectorStoreIdExists: Boolean(vectorStoreId),
  });

  // If KB exists for this uni: file_search first then web fallback inside runUniversityGeneral
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

  // Otherwise: web-only fallback
  console.log("[runGeneral] route", {
    traceId,
    route: "web_only_fallback",
    reason: !uniSlug ? "unknown_university" : "no_vector_store_for_university",
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

  return (resp.output_text ?? "").trim();
}
