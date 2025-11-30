import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { z } from "zod";
import OpenAI from "openai";
import {
  WORD_LIMIT,
  CATEGORY_LIMIT,
} from "@/components/onboarding/chunks/utils/ChunkUtils";

// Define chunk schema (no chunk_id)
const ResponseChunkSchema = z.object({
  category: z
    .string()
    .max(
      CATEGORY_LIMIT,
      `Category must be ${CATEGORY_LIMIT} characters or less`
    ),
  content: z
    .string()
    .refine((val) => val.trim().split(/\s+/).length <= WORD_LIMIT, {
      message: `Content must be ${WORD_LIMIT} words or less`,
    }),
});

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: `
You are a semantic chunker for documents about users/organisations.
Task: Split the given document into logical chunks.
Output Format: Return a JSON array with NO markdown formatting, explanations or preambles 
[
  { "category": "Experience", "content": "..." },
  { "category": "Skills", "content": "..." }
]
Include as much relevant information as possible in each chunk separate them if necessary.

CHUNK STRUCTURE:
1. "category": A classification label (max ${CATEGORY_LIMIT} chars)
   - Use consistent naming (don't mix "Work Experience" and "Professional Experience")
   - Use general terms: "Events", "Volunteering", "Awards"
   - Examples: Experience, Education, Skills, Leadership, Projects, Certifications

2. "content": The actual information (max ${WORD_LIMIT} words)
   - MUST include the person/organization name in EVERY chunk
   - Include relevant timeframes (years, dates, durations) when available
   - Keep sentences intact - never cut mid-sentence
   - Make each chunk independently understandable

STRICT CONTENT GUIDELINES:
Include: Names, cities/countries, years, achievements, roles, technologies, outcomes
Exclude: Email addresses, phone numbers, street addresses, SSNs, private identifiers
Remove: Harmful, discriminatory, or sensitive personal information

CHUNKING STRATEGY:
- Group related information logically (e.g., all skills together, each job separately)
- If a section is too long, split into multiple chunks with the SAME category
- Prioritize completeness - include important context and details
- Avoid redundancy between chunks

Examples: 

USER DOCUMENT: 
"John Doe graduated from UniMelb in 2015 with a degree in Computer Science. He worked at Google from 2015-2018 as a Software Engineer, building search infrastructure. In 2019, he joined Facebook as a Senior Engineer. John is skilled in Python, Java, and distributed systems."
CORRECT OUTPUT:
[
  { "category": "Education", "content": "John Doe graduated from the University of Melbourne in 2015 with a degree in Computer Science." },
  { "category": "Experience", "content": "John Doe worked at Google from 2015-2018 as a Software Engineer, where he built search infrastructure." },
  { "category": "Experience", "content": "John Doe joined Facebook as a Senior Engineer in 2019." },
  { "category": "Skills", "content": "John Doe is skilled in Python, Java, and distributed systems." }
]

ORGANIZATION DOCUMENT:
"DSCubed hosts a semesterly Kaggle Competition. We also host an annual Datathon with other clubs"

CORRECT OUTPUT:
[
  { "category": "Events", "content": "DSCubed hosts an annual Datathon." },
  { "category": "Competitions", "content": "DSCubed runs a semesterly Kaggle Competition." }
]

Now process the following document: 
`,
        },
        { role: "user", content: text },
      ],
    });

    const raw = response.output_text;
    let chunks = [];
    try {
      chunks = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse chunks" },
        { status: 500 }
      );
    }

    // Validate chunks array
    const chunksResult = z.array(ResponseChunkSchema).safeParse(chunks);
    if (!chunksResult.success) {
      return NextResponse.json(
        { error: "Invalid chunk format", details: chunksResult.error.errors },
        { status: 400 }
      );
    }

    const chunksWithId = chunksResult.data.map((chunk) => ({
      ...chunk,
      chunk_id: crypto.randomUUID(),
    }));

    return NextResponse.json({ success: true, chunks: chunksWithId });
  } catch (error) {
    console.error("Semantic chunking error:", error);
    return NextResponse.json({ error: "Chunking failed" }, { status: 500 });
  }
}
