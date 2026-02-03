/**
 * Unified router for the general chatbot pipeline.
 *
 * Replaces the scattered regex heuristics across multiple files with a single
 * LLM-based classification. Slightly more latency (~200ms) but much more
 * robust and maintainable.
 *
 * Consolidates:
 * - planGeneral.ts (LLM classification)
 * - normalisedPlannedUni.ts (LLM output cleanup)
 * - uniSlug.ts (university name normalization)
 * - heuristic regex from runGeneral.ts
 */

import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";

// ============================================================================
// Types
// ============================================================================

/** Supported universities for routing */
export const SUPPORTED_UNIVERSITIES = {
  unimelb: {
    name: "University of Melbourne",
  },
  monash: {
    name: "Monash University",
  },
  rmit: {
    name: "RMIT University",
  },
  uwa: {
    name: "University of Western Australia",
  },
} as const;

export type UniversitySlug = keyof typeof SUPPORTED_UNIVERSITIES;
export type KBIntent = "official" | "union" | "both";

export interface RouterResult {
  /** Where to route the query */
  route: "connect3" | "university" | "web";
  /** University slug if route is "university" */
  university: UniversitySlug | null;
  /** Which KB to prioritize */
  intent: KBIntent;
  /** LLM's reasoning (for debugging) */
  reason: string;
}

// ============================================================================
// LLM Classification Schema
// ============================================================================

const RouterSchema = z.object({
  route: z
    .enum(["connect3", "university", "web"])
    .describe(
      "Where to route this query: 'connect3' for app help, 'university' for uni-specific questions, 'web' for general questions",
    ),
  university: z
    .enum(["unimelb", "monash", "rmit", "uwa", "unknown"])
    .nullable()
    .describe(
      "The university slug if detected, null if not university-related, 'unknown' if uni-related but can't identify which",
    ),
  intent: z
    .enum(["official", "union", "both"])
    .describe(
      "Which knowledge base to prioritize: 'official' for admin/policy, 'union' for clubs/advocacy, 'both' if unclear",
    ),
  reason: z.string().describe("Brief explanation of routing decision"),
});

export type RouterOutput = z.infer<typeof RouterSchema>;

// ============================================================================
// Router Prompt
// ============================================================================

const ROUTER_SYSTEM_PROMPT = `You are a routing classifier for Connect3, a student networking app.

## Your Task
Classify the user's query into one of three routes:

### Route: "connect3"
User is asking about the Connect3 app itself:
- How to use the app, profile setup, matching features
- "How do I edit my profile?", "What is Connect3?", "How does matching work?"
- General greetings, small talk, jokes

### Route: "university"  
User needs university-specific information:
- Policies, enrollment, subjects, timetables, campus services
- Clubs/societies AT a specific university
- Scholarships, special consideration, academic procedures
- "How do I apply for special consideration at UniMelb?"

### Route: "web"
General knowledge questions that don't fit above:
- Generic career advice, study tips (not uni-specific)
- Questions where web search would be more appropriate

## University Detection
If route is "university", identify which university:
- **unimelb**: UniMelb, University of Melbourne, Melbourne Uni, UoM
- **monash**: Monash, Monash University
- **rmit**: RMIT, RMIT University
- **uwa**: UWA, University of Western Australia
- **unknown**: University-related but can't identify which one

Set university to null if route is not "university".

## Intent (for university route)
- **official**: Admin/policy questions (enrollment, fees, special consideration, exams, graduation)
- **union**: Student union questions (clubs, societies, advocacy, welfare, events, food)
- **both**: Could be either or informational

## Important
- Be liberal with routing to "university" if there's any university context
- If user mentions "my uni" without specifying which, set university to "unknown"
- Default intent to "both" if unsure

Return JSON matching the schema.`;

// ============================================================================
// Main Router Function
// ============================================================================

export async function routeQuery(
  openai: OpenAI,
  query: string,
  prevMessages: ResponseInput,
  userUniversity?: string | null,
  tldr?: string,
): Promise<RouterResult> {
  try {
    const resp = await openai.responses.parse({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: ROUTER_SYSTEM_PROMPT },
        ...prevMessages,
        { role: "system", content: `User Info: ${tldr ?? "Not Provided"}` },
        { role: "user", content: query },
      ],
      text: { format: zodTextFormat(RouterSchema, "router") },
      temperature: 0,
    });

    if (!resp.output_parsed) {
      console.warn("[router] Failed to parse, defaulting to web");
      return {
        route: "web",
        university: null,
        intent: "both",
        reason: "parse_failed",
      };
    }

    const result = resp.output_parsed;

    // Handle "unknown" university - fall back to user's profile university
    let university: UniversitySlug | null = null;
    if (result.route === "university") {
      if (result.university && result.university !== "unknown") {
        university = result.university as UniversitySlug;
      } else if (userUniversity && userUniversity !== "others") {
        // User's profile already stores a valid slug
        university = userUniversity as UniversitySlug;
      }
    }

    // If university route but no known university, fall back to web
    const finalRoute =
      result.route === "university" && !university ? "web" : result.route;

    return {
      route: finalRoute as RouterResult["route"],
      university,
      intent: result.intent,
      reason: result.reason,
    };
  } catch (err) {
    console.error("[router] Error:", err);
    return { route: "web", university: null, intent: "both", reason: "error" };
  }
}
