import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import z from "zod";
import { sanitizeResumeText } from "./sanitizeResume";
import {
  universities,
  University,
} from "@/components/profile/details/univeristies";

const LINK_TYPES = [
  "linkedin-user",
  "linkedin-company",
  "github",
  "instagram",
  "facebook",
  "discord",
  "discord-server",
  "x",
  "youtube",
  "website",
  "tiktok",
  "reddit",
  "wechat",
  "xiaohongshu",
] as const;

export type LinkType = (typeof LINK_TYPES)[number];

export type ExtractedLink = {
  type: LinkType;
  details: string;
};

export interface ExtractedProfileDetails {
  tldr: string | null;
  universityKey: University | null;
  links: ExtractedLink[];
}

const UNIVERSITY_KEYS = Object.keys(universities) as University[];

const resumeProfileSchema = z.object({
  tldr: z.string().nullable().optional(),
  universityName: z.string().nullable().optional(),
  links: z
    .array(
      z.object({
        type: z.enum(LINK_TYPES),
        details: z.string(),
      })
    )
    .default([]),
});

const linkPatterns: Array<{ type: LinkType; regexes: RegExp[] }> = [
  {
    type: "linkedin-user",
    regexes: [/linkedin\.com\/in\/([^/?#]+)/i],
  },
  {
    type: "linkedin-company",
    regexes: [/linkedin\.com\/company\/([^/?#]+)/i],
  },
  {
    type: "github",
    regexes: [/github\.com\/([^/?#]+)/i],
  },
  {
    type: "instagram",
    regexes: [/instagram\.com\/([^/?#]+)/i],
  },
  {
    type: "facebook",
    regexes: [/facebook\.com\/([^/?#]+)/i],
  },
  {
    type: "discord-server",
    regexes: [
      /discord\.gg\/([^/?#]+)/i,
      /discord\.com\/invite\/([^/?#]+)/i,
    ],
  },
  {
    type: "x",
    regexes: [/x\.com\/([^/?#]+)/i, /twitter\.com\/([^/?#]+)/i],
  },
  {
    type: "youtube",
    regexes: [/youtube\.com\/@([^/?#]+)/i],
  },
  {
    type: "tiktok",
    regexes: [/tiktok\.com\/@([^/?#]+)/i],
  },
  {
    type: "reddit",
    regexes: [
      /reddit\.com\/user\/([^/?#]+)/i,
      /reddit\.com\/u\/([^/?#]+)/i,
    ],
  },
];

const placeholderValues = new Set([
  "n/a",
  "na",
  "none",
  "unknown",
  "-",
  "—",
  "null",
]);

// Platform names only (no URL/handle) — do not create a link for these
const platformNameOnly = new Set([
  "linkedin",
  "github",
  "instagram",
  "facebook",
  "discord",
  "x",
  "twitter",
  "youtube",
  "tiktok",
  "reddit",
  "wechat",
  "xiaohongshu",
]);

const trailingPunctuation = /[).,;!?]+$/g;
const urlScheme = /^https?:\/\//i;
const urlLikeDomain =
  /\b[a-z0-9-]+\.(com|org|net|edu|io|co|gov|me|dev|ai|app|ca|uk|au|us|nz|de|fr|jp|cn)(\/|$)/i;

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (urlScheme.test(trimmed)) return trimmed;
  if (trimmed.startsWith("www.") || urlLikeDomain.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
};

const matchUrlToLink = (url: string): ExtractedLink | null => {
  for (const pattern of linkPatterns) {
    for (const regex of pattern.regexes) {
      const match = url.match(regex);
      if (match && match[1]) {
        return { type: pattern.type, details: match[1] };
      }
    }
  }
  return null;
};

const normalizeLink = (link: ExtractedLink): ExtractedLink | null => {
  const raw = link.details.trim().replace(trailingPunctuation, "");
  if (!raw) return null;

  const lower = raw.toLowerCase();
  if (placeholderValues.has(lower)) return null;
  // Reject when only the platform name is present (e.g. "LinkedIn" with no URL/handle)
  if (platformNameOnly.has(lower)) return null;

  const url = normalizeUrl(raw);
  if (url) {
    const matched = matchUrlToLink(url);
    if (matched) return matched;

    if (link.type === "website") {
      return { type: "website", details: url };
    }

    try {
      const parsed = new URL(url);
      const segment = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
      if (segment) {
        return { type: link.type, details: segment };
      }
    } catch {
      // fall through
    }
  }

  const cleaned = raw.replace(/^@/, "");
  if (!cleaned) return null;
  return { type: link.type, details: cleaned };
};

const dedupeLinks = (links: ExtractedLink[]) => {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.type}:${link.details.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildUniversityList = () =>
  UNIVERSITY_KEYS.map((key) => universities[key].name).join("\n");

// Map full university name (LLM output) back to University key
const universityNameToKey = (name: string | null | undefined): University | null => {
  const raw = name?.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  for (const key of UNIVERSITY_KEYS) {
    if (universities[key].name.toLowerCase() === lower) return key;
  }
  if (lower === "other university" || lower === "others") return "others";
  return "others";
};

export async function extractResumeProfileDetails(
  resumeText: string,
  openai: OpenAI
): Promise<ExtractedProfileDetails> {
  const sanitizedText = sanitizeResumeText(resumeText);

  const systemPrompt = `
You are an extraction engine for a profile-building app.
Extract ONLY from the provided resume text. Do NOT invent or guess.

Return a JSON object with:
- "tldr": 2–3 sentences, first-person, LinkedIn-style summary. Professional and modest tone; no hype.
  Use "I" statements. If there is not enough information, return null.
- "universityName": the full, long-hand university name from the list below, or null if no university is mentioned.
  Return the exact name as written (e.g. "University of Melbourne", "Monash University"), not a short-hand or code.
  If a university is mentioned but it does NOT match the allowed list, return "Other University".
- "links": an array of objects { "type": <allowed type>, "details": <string> }.

Allowed university names (return one of these exactly, or "Other University"):
${buildUniversityList()}
Other University

Allowed link types:
${LINK_TYPES.join(", ")}

Link details rules:
- Only include a link when there is an actual URL (e.g. linkedin.com/in/username, https://...) or a platform handle (e.g. @username) present in the text.
- Do NOT include a link when only the platform name appears as plain text (e.g. the word "LinkedIn" or "GitHub" with no URL or handle).
- Do NOT include email addresses or phone numbers.
- For known platforms (LinkedIn, GitHub, Instagram, Facebook, X, YouTube, TikTok, Reddit, Discord server),
  return ONLY the username/slug (no URL, no @).
- For "website", return the full URL (include https:// if available).
- For "discord", "wechat", "xiaohongshu", return the handle as written (no URL needed).
- Text in "[Hyperlinks from document]:" is a list of URLs extracted from clickable links in the PDF; you may use these as link sources.

Return ONLY the JSON object. No extra text.
`.trim();

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: sanitizedText },
    ],
    text: { format: zodTextFormat(resumeProfileSchema, "resume_profile") },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse resume profile extraction response");
  }

  const parsed = response.output_parsed as z.infer<typeof resumeProfileSchema>;

  const tldr = (parsed.tldr ?? "").trim();
  const universityKey = universityNameToKey(parsed.universityName);

  const normalizedLinks = dedupeLinks(
    (parsed.links ?? [])
      .map((link) => normalizeLink(link))
      .filter((link): link is ExtractedLink => Boolean(link))
  );

  return {
    tldr: tldr.length > 0 ? tldr : null,
    universityKey,
    links: normalizedLinks,
  };
}
