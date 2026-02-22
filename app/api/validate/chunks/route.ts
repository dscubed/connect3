import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { rateLimit } from "@/lib/api/rate-limit";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { validateTokenLimit, Tier } from "@/lib/api/token-guard";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define schema for validation result
const ValidationSchema = z.object({
  safe: z.boolean(),
  relevant: z.boolean(),
  sensitive: z.boolean(),
  detectedNames: z.array(z.string()),
  belongsToUser: z.boolean(),
  categoryValid: z.boolean(),
  categoryMatchesContent: z.boolean(),
  reason: z.string(),
  suggestion: z.string(),
});

// Rate limiting per user
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user via Supabase Auth
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;

    // Validate request body
    const body = await req.json();
    const { text, fullName } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid text content" },
        { status: 400 }
      );
    }

    if (text.length > 50000) {
      // Limit text size
      return NextResponse.json(
        { error: "Text content too large" },
        { status: 400 }
      );
    }

    const tier: Tier = "verified";
    const tokenCheck = validateTokenLimit(text, tier);
    if (!tokenCheck.ok) return tokenCheck.response;

    // Rate limiting per user
    try {
      await limiter.check(10, user.id); // 10 requests per minute per user
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    console.log(
      `Validation request from user: ${user.id}, text length: ${text.length}`
    );

    // 6. Call OpenAI API
    const systemPrompt = `
    You are a validation engine for a profile-building app. 
    The user's legal full name is: "${fullName || "..."}".

    A "chunk" contains a category and content describing part of the user's personal or professional profile.
    Your job is to classify the chunk into the fields defined below.

    -----------------------
    FIELD DEFINITIONS
    -----------------------

    1. safe
    - true if the text contains no harmful, hateful, illegal, pornographic, explicit, or disallowed content.

    2. relevant
    - true if the content helps describe the user's personal or professional profile:
      (work experience, responsibilities, skills, tools, education, projects, achievements, interests, or bio).
    - Personal interests are allowed if they are safe.
    - Jokes, quotes, unrelated stories, or random rants → false.

    3. sensitive
    - true if personal PII is present, including:
      - personal phone number  
      - personal email  
      - exact street/home address  
    - Allowed:
      - city/state only  
      - work phone, work email  

    4. detectedNames
    - A list of all human names mentioned in the content.

    5. belongsToUser
    - true if the chunk clearly describes the user "${fullName}".
    - Standard resume-style statements (“Led a team…”) count as describing the user.
    - If another named person is described as the subject, set false.
    - If uncertain, set false.
    - Do NOT assume different names refer to the same person.

    6. categoryValid
    - true only if the category is one of:
      ["Work Experience", "Education", "Skills", "Projects", "Achievements", "Interests", "Bio"]

    7. categoryMatchesContent
    - Determines whether the content fits the meaning of the category.
    - If categoryValid = false → categoryMatchesContent = false.

    Category matching rules:

    Work Experience:
    - Matches: roles, responsibilities, job titles, companies, dates, impact.
    - Not matches: pure skill lists, bios, interests, unrelated info.

    Education:
    - Matches: schools, degrees, majors, coursework, graduation dates.
    - Not matches: job duties, skill lists, generic personal statements.

    Skills:
    - Matches: lists of tools, technologies, frameworks, programming languages, competencies.
    - Not matches: paragraphs about job history, detailed project descriptions, interests.

    Projects:
    - Matches: descriptions of things the user built, created, designed, researched, or contributed to.
    - Not matches: only job titles, pure lists of skills, abstract interests.

    Achievements:
    - Matches: awards, certifications, measurable accomplishments, honors, distinctions.
    - Not matches: generic responsibilities or unrelated personal details.

    Interests:
    - Matches: hobbies, activities, personal interests.
    - Not matches: work history, academic details, technical skill lists.

    Bio:
    - Matches: short personal summary (who they are, background, goals).
    - Not matches: pure lists of skills or job duties with no narrative.

    If content could reasonably fit multiple valid categories, choose the MOST appropriate one and set categoryMatchesContent = true.

    8. suggestion
    - Provide ONE short, actionable suggestion only if it would meaningfully improve the chunk.
    - The goal is to gently help the user strengthen the highlight, not to block or criticise it.
  
    Examples of when a suggestion IS appropriate:
      - The category is invalid → suggest a valid category.
      - The content clearly fits a better category → suggest the more suitable category.
      - The content is somewhat irrelevant → suggest shaping it into a skill, task, experience, or interest.
      - The text does not clearly describe the user → suggest rewriting it from the user’s perspective.
      - Sensitive personal information appears → suggest removing or generalising it.
      - The chunk is accepted but noticeably vague or generic → suggest adding one concrete action, tool, or outcome.
  
    Examples of when a suggestion should NOT be given:
      - The chunk is already concrete, detailed, and aligned with its category.
      - The suggested improvement would be subjective or nitpicky.
      - The content is stylistically valid but simply concise.
  
    Additional rules:
      - Suggestions must be specific, not generic (“add details” is too vague).
      - Tone must be neutral and supportive, never judgmental.
      - If nothing stands out as a clear improvement, return an empty string.

    -----------------------
    RESPONSE FORMAT
    -----------------------

    Respond ONLY as a JSON object:

    {
      "safe": boolean,
      "relevant": boolean,
      "sensitive": boolean,
      "detectedNames": string[],
      "belongsToUser": boolean,
      "categoryValid": boolean,
      "categoryMatchesContent": boolean,
      "reason": string,
      "suggestion": string
    }

    "reason" MUST be exactly one sentence summarizing the main factor.
    "suggestion" MUST be one short actionable improvement.
    `.trim();

    const response = await client.responses.parse({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      text: {
        format: zodTextFormat(ValidationSchema, "validation"),
      },
    });

    const result = response.output_parsed;

    // Log the validation result for monitoring
    console.log(
      `Validation result for user ${user.id}: safe=${result?.safe}, relevant=${result?.relevant},
      sensitive=${result?.sensitive}, belongsToUser=${result?.belongsToUser}, 
      categoryValid=${result?.categoryValid}, categoryMatchesContent=${result?.categoryMatchesContent}`
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Validation API error:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    return NextResponse.json(
      {
        safe: false,
        relevant: false,
        belongsToUser: false,
        categoryValid: false,
        categoryMatchesContent: false,
        reason: `Validation failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
