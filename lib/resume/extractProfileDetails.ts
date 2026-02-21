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
  universityKey: z
    .enum(UNIVERSITY_KEYS as [University, ...University[]])
    .nullable()
    .optional(),
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
  UNIVERSITY_KEYS.map((key) => `${key} = ${universities[key].name}`).join("\n");

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
- "universityKey": one of the allowed keys below, or null if no university is mentioned.
  If a university is mentioned but it does NOT match the allowed list, return "others".
- "links": an array of objects { "type": <allowed type>, "details": <string> }.

Allowed university keys:
${buildUniversityList()}

Allowed link types:
${LINK_TYPES.join(", ")}

Link details rules:
- Only include links/handles explicitly present in the resume text.
- Do NOT include email addresses or phone numbers.
- For known platforms (LinkedIn, GitHub, Instagram, Facebook, X, YouTube, TikTok, Reddit, Discord server),
  return ONLY the username/slug (no URL, no @).
- For "website", return the full URL (include https:// if available).
- For "discord", "wechat", "xiaohongshu", return the handle as written (no URL needed).

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
  const universityKey = parsed.universityKey ?? null;

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
