/**
 * Allowed email domains for sign-up, matching universities in the university selector:
 * University of Melbourne, UWA, Monash, RMIT (excludes "others").
 *
 * - unimelb: student.unimelb.edu.au, unimelb.edu.au
 * - uwa: student.uwa.edu.au, uwa.edu.au
 * - monash: student.monash.edu, monash.edu
 * - rmit: student.rmit.edu.au, rmit.edu.au
 */
const DOMAIN_TO_UNIVERSITY: Record<string, "unimelb" | "uwa" | "monash" | "rmit"> = {
  "unimelb.edu.au": "unimelb",
  "student.unimelb.edu.au": "unimelb",
  "uwa.edu.au": "uwa",
  "student.uwa.edu.au": "uwa",
  "monash.edu": "monash",
  "student.monash.edu": "monash",
  "rmit.edu.au": "rmit",
  "student.rmit.edu.au": "rmit",
};

const ALLOWED_EMAIL_DOMAINS = Object.keys(
  DOMAIN_TO_UNIVERSITY
) as (keyof typeof DOMAIN_TO_UNIVERSITY)[];

/**
 * Derives the university key from an email domain.
 * Returns null if the email is not from an allowed university domain.
 */
export function getUniversityFromEmail(
  email: string
): "unimelb" | "uwa" | "monash" | "rmit" | null {
  if (!email || typeof email !== "string") return null;
  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex < 1) return null;
  const domain = normalized.slice(atIndex + 1);
  const exact = DOMAIN_TO_UNIVERSITY[domain];
  if (exact) return exact;
  for (const [allowedDomain, uni] of Object.entries(DOMAIN_TO_UNIVERSITY)) {
    if (domain.endsWith("." + allowedDomain)) return uni;
  }
  return null;
}

export function validateUniversityEmail(
  email: string
): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return {
      valid: false,
      error: "Please enter your university email address",
    };
  }

  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex < 1) {
    return {
      valid: false,
      error: "Please enter a valid university email address",
    };
  }

  const domain = normalized.slice(atIndex + 1);
  const isAllowed = ALLOWED_EMAIL_DOMAINS.some(
    (allowed) =>
      domain === allowed || domain.endsWith("." + allowed)
  );

  if (!isAllowed) {
    return {
      valid: false,
      error:
        "Sign-up is limited to university email addresses from University of Melbourne, UWA, Monash, or RMIT",
    };
  }

  return { valid: true };
}
