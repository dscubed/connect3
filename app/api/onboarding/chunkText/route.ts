import { NextRequest, NextResponse } from "next/server";
import { checkBotId } from "botid/server";

/**
 * Deterministic stub for chunking resume text.
 * - Accepts: { text: string }
 * - Returns: { success: true, chunks: [{ category: string, content: string, chunk_id?: string }] }
 *
 * Heuristics:
 * - Split by two or more newlines into sections
 * - If a section begins with a common heading (Education, Experience, Skills, Projects, Summary, Awards), use that as category
 * - Otherwise classify as "Other"
 */

const DEFAULT_CATEGORIES = [
  "Experience",
  "Education",
  "Skills",
  "Projects",
  "Summary",
  "Awards",
  "Publications",
  "Certifications",
  "Volunteer",
  "Other",
];

function detectCategory(section: string) {
  const firstLine = section.split("\n")[0].trim();
  if (!firstLine) return "Other";
  const normalized = firstLine.replace(/[:\s]+$/g, "").toLowerCase();
  for (const c of DEFAULT_CATEGORIES) {
    if (normalized === c.toLowerCase()) return c;
    // match if the heading contains the category word
    if (normalized.includes(c.toLowerCase())) return c;
  }

  // If the section contains keywords, try matching
  const keywords: Record<string, string[]> = {
    Experience: ["worked at", "responsible for", "experience", "developed"],
    Education: ["university", "degree", "bachelor", "master", "graduat"],
    Skills: ["skills", "proficient", "experienced in", "familiar with"],
    Projects: ["project", "built", "implemented", "led"],
  };
  const lower = section.toLowerCase();
  for (const [cat, keys] of Object.entries(keywords)) {
    if (keys.some((k) => lower.includes(k))) return cat;
  }

  return "Other";
}

export async function POST(req: NextRequest) {
  try {
    const botVerification = await checkBotId();
    if (botVerification.isBot) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const text = body?.text;
    if (!text || typeof text !== "string") {
      return NextResponse.json({ success: false, error: "Missing text field" }, { status: 400 });
    }

    console.log("Original text length:", text.length);
    console.log("First 200 chars:", text.substring(0, 200));

    // Split into sections by 2+ newlines (commonly used to separate resume sections)
    const rawSections = text
      .split(/\n{2,}|(?=\n[A-Z][A-Za-z ]{2,}\n)/)
      .map((s: string) => s.trim())
      .filter(Boolean);
        
    const chunks = rawSections.map((section: string, i: number) => {
      const category = detectCategory(section);
      // Use a proper UUID for chunk_id to match DB expectations (uuid type)
      const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${i}`;
      
      console.log(`Chunk ${i}: category=${category}, length=${section.length}`);
      
      return {
        category,
        content: section,
        chunk_id: id,
      };
    });

    return NextResponse.json({ success: true, chunks }, { status: 200 });
  } catch (err) {
    console.error("ChunkText stub error:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
