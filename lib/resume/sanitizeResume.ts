/**
 * Utilities for removing sensitive information from resume text
 */

/**
 * Removes phone numbers from text (supports various formats)
 */
export function removePhoneNumbers(text: string): string {
  // Match various phone number formats more precisely:
  const phonePatterns = [
    // Australian mobile: 04XX XXX XXX or 04XXXXXXXX (must start with 04)
    /\b04\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b/g,
    // Australian with country code: +61 4XX XXX XXX or +61 426-469-111
    /\+\s*61\s*4\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b/g,
    // Australian landline: (0X) XXXX XXXX
    /\(0\d\)\s*\d{4}\s*\d{4}\b/g,
    // US format: (XXX) XXX-XXXX or XXX-XXX-XXXX (requires dashes or parentheses)
    /\(\d{3}\)\s*\d{3}[\s.-]\d{4}\b/g,
    /\b\d{3}-\d{3}-\d{4}\b/g,
  ];

  let sanitized = text;
  for (const pattern of phonePatterns) {
    sanitized = sanitized.replace(pattern, "[Phone removed]");
  }
  return sanitized;
}

/**
 * Removes email addresses from text
 */
export function removeEmailAddresses(text: string): string {
  // Match email addresses
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return text.replace(emailPattern, "[Email removed]");
}

/**
 * Removes physical addresses from text (less aggressive version)
 */
export function removeAddresses(text: string): string {
  let sanitized = text;

  // Only match clear street addresses with number + street type
  const addressPatterns = [
    // Street addresses: "123 Main Street", "45 Smith Rd" (number followed by name and street type)
    /\b\d+[A-Za-z]?\s+[A-Za-z]+(?:\s+[A-Za-z]+)?\s+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Way|Boulevard|Blvd|Court|Ct|Place|Pl|Crescent|Cres|Terrace|Tce|Highway|Hwy)\b/gi,
    // Unit/Apartment addresses: "Unit 5, 123 Main St"
    /\b(?:Unit|Apt|Apartment|Suite)\s+\d+[A-Za-z]?\s*,?\s*\d+\s+[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln)\b/gi,
    // Australian postcode with state: "VIC 3000" or "NSW 2000"
    /\b(?:VIC|NSW|QLD|SA|WA|TAS|NT|ACT)\s+\d{4}\b/gi,
  ];

  for (const pattern of addressPatterns) {
    sanitized = sanitized.replace(pattern, "[Address removed]");
  }

  return sanitized;
}

/**
 * Removes WAM (Weighted Average Mark), GPA, and academic marks from text
 */
export function removeAcademicMarks(text: string): string {
  let sanitized = text;

  // Patterns for WAM/GPA mentions - only when explicitly labeled
  const markPatterns = [
    // WAM: 78.5, WAM:78.5, WAM 78.5
    /\bWAM\s*[:=]?\s*\d+\.?\d*\b/gi,
    // GPA: 3.8/4.0, GPA: 3.8, GPA 3.8
    /\bGPA\s*[:=]?\s*\d+\.?\d*(?:\s*\/\s*\d+\.?\d*)?\b/gi,
    // Weighted Average Mark: 78.5
    /\bWeighted\s+Average\s+Mark\s*[:=]?\s*\d+\.?\d*\b/gi,
    // Grade Point Average: 3.8
    /\bGrade\s+Point\s+Average\s*[:=]?\s*\d+\.?\d*(?:\s*\/\s*\d+\.?\d*)?\b/gi,
  ];

  for (const pattern of markPatterns) {
    sanitized = sanitized.replace(pattern, "[Academic mark removed]");
  }

  return sanitized;
}

/**
 * Sanitizes resume text by removing all sensitive information
 * @param text Original resume text
 * @returns Sanitized text with sensitive info removed
 */
export function sanitizeResumeText(text: string): string {
  let sanitized = text;
  console.log("Original Resume Text:", sanitized);

  // Apply all sanitization functions in order
  sanitized = removePhoneNumbers(sanitized);
  console.log("After removing phone numbers:", sanitized);
  sanitized = removeEmailAddresses(sanitized);
  console.log("After removing email addresses:", sanitized);
  sanitized = removeAddresses(sanitized);
  console.log("After removing addresses:", sanitized);
  sanitized = removeAcademicMarks(sanitized);
  console.log("After removing academic marks:", sanitized);

  // Clean up multiple consecutive "[... removed]" markers
  sanitized = sanitized.replace(
    /\[(?:Phone|Email|Address|Academic mark) removed\]\s*(?:\[(?:Phone|Email|Address|Academic mark) removed\]\s*)+/g,
    "[Sensitive info removed]"
  );

  // Clean up excessive whitespace but preserve structure
  sanitized = sanitized.replace(/\n{3,}/g, "\n\n");
  sanitized = sanitized.replace(/[ \t]{2,}/g, " ");

  return sanitized.trim();
}
