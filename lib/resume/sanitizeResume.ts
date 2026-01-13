/**
 * Utilities for removing sensitive information from resume text
 */

/**
 * Removes phone numbers from text (supports various formats)
 */
export function removePhoneNumbers(text: string): string {
  // Match various phone number formats:
  // - Australian: 04XX XXX XXX, +61 4XX XXX XXX, (04) XXXX XXXX
  // - International: +XX XXXX XXXX, (XXX) XXX-XXXX
  // - Common formats: XXX-XXX-XXXX, XXX.XXX.XXXX, XXX XXX XXXX
  const phonePatterns = [
    // Australian mobile: 04XX XXX XXX or 04XXXXXXXX
    /\b0?4\d{2}[\s-]?\d{3}[\s-]?\d{3}\b/g,
    // Australian with country code: +61 4XX XXX XXX
    /\+\s*61\s*4\d{2}[\s-]?\d{3}[\s-]?\d{3}\b/g,
    // Australian landline: (0X) XXXX XXXX
    /\(0\d\)\s*\d{4}\s*\d{4}\b/g,
    // International formats: +XX XXXX XXXX
    /\+\d{1,3}[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}\b/g,
    // US/Common formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX
    /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    // Generic: XXX XXX XXXX (3-4 groups of digits)
    /\b\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g,
  ];

  let sanitized = text;
  for (const pattern of phonePatterns) {
    sanitized = sanitized.replace(pattern, "[Phone number removed]");
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
 * Removes physical addresses from text
 */
export function removeAddresses(text: string): string {
  let sanitized = text;
  
  // Common address patterns
  const addressPatterns = [
    // Street addresses: "123 Main Street", "45 Unit 2 Smith Rd"
    /\b\d+\s+(?:Unit\s+)?[A-Za-z0-9\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Way|Boulevard|Blvd|Court|Ct|Place|Pl|Crescent|Cres|Terrace|Tce)\b/gi,
    // Postcodes (Australian: 4 digits, US: 5 digits, UK: various)
    /\b\d{4,5}\b(?=\s*(?:VIC|NSW|QLD|SA|WA|TAS|NT|ACT|Australia|USA|United States|UK|United Kingdom)?)/gi,
    // State abbreviations (Australian states)
    /\b(?:VIC|NSW|QLD|SA|WA|TAS|NT|ACT)\s+\d{4}\b/gi,
    // Common address keywords followed by details
    /\b(?:Address|Residence|Location):\s*[A-Za-z0-9\s,]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr)\b/gi,
  ];

  for (const pattern of addressPatterns) {
    sanitized = sanitized.replace(pattern, "[Address removed]");
  }

  // Remove lines that are primarily addresses (heuristic)
  const lines = sanitized.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    // Skip lines that look like addresses (contain street/road keywords with numbers)
    if (
      /\d+/.test(trimmed) &&
      /(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Way|Boulevard|Blvd|Court|Ct|Place|Pl)/i.test(
        trimmed
      )
    ) {
      return false;
    }
    return true;
  });

  return filteredLines.join("\n");
}

/**
 * Removes WAM (Weighted Average Mark), GPA, and academic marks from text
 */
export function removeAcademicMarks(text: string): string {
  let sanitized = text;

  // Patterns for WAM/GPA mentions
  const markPatterns = [
    // WAM: 78.5, WAM:78.5, WAM 78.5
    /\bWAM\s*[:=]?\s*\d+\.?\d*\b/gi,
    // GPA: 3.8/4.0, GPA: 3.8, GPA 3.8
    /\bGPA\s*[:=]?\s*\d+\.?\d*(?:\s*\/\s*\d+\.?\d*)?\b/gi,
    // Weighted Average Mark: 78.5
    /\bWeighted\s+Average\s+Mark\s*[:=]?\s*\d+\.?\d*\b/gi,
    // Average: 78, Average mark: 78.5
    /\bAverage\s+(?:mark|grade|score)?\s*[:=]?\s*\d+\.?\d*\b/gi,
    // Grade Point Average: 3.8
    /\bGrade\s+Point\s+Average\s*[:=]?\s*\d+\.?\d*\b/gi,
    // Academic marks in education sections (e.g., "Graduated with 78.5 WAM")
    /\b(?:graduated|completed|achieved|obtained)\s+(?:with\s+)?(?:a\s+)?(?:WAM|GPA|average|mark)\s+of\s+\d+\.?\d*\b/gi,
    // Standalone high marks that might be WAM (e.g., "78.5" on its own line in education)
    /^\s*\d{2,3}\.?\d*\s*$/gm, // Lines with just a number (likely a mark)
  ];

  for (const pattern of markPatterns) {
    sanitized = sanitized.replace(pattern, "[Academic mark removed]");
  }

  // Remove lines that are primarily about academic marks
  const lines = sanitized.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim().toLowerCase();
    // Skip lines that are primarily about marks
    if (
      (trimmed.includes("wam") || trimmed.includes("gpa")) &&
      /\d+/.test(trimmed)
    ) {
      return false;
    }
    // Skip lines that are just numbers (likely marks)
    if (/^\d{2,3}\.?\d*$/.test(trimmed)) {
      return false;
    }
    return true;
  });

  return filteredLines.join("\n");
}

/**
 * Sanitizes resume text by removing all sensitive information
 * @param text Original resume text
 * @returns Sanitized text with sensitive info removed
 */
export function sanitizeResumeText(text: string): string {
  let sanitized = text;

  // Apply all sanitization functions in order
  sanitized = removePhoneNumbers(sanitized);
  sanitized = removeEmailAddresses(sanitized);
  sanitized = removeAddresses(sanitized);
  sanitized = removeAcademicMarks(sanitized);

  // Clean up multiple consecutive "[... removed]" markers
  sanitized = sanitized.replace(
    /\[(?:Phone number|Email|Address|Academic mark) removed\]\s*(?:\[(?:Phone number|Email|Address|Academic mark) removed\]\s*)+/g,
    "[Sensitive information removed]"
  );

  // Clean up excessive whitespace
  sanitized = sanitized.replace(/\n{3,}/g, "\n\n");
  sanitized = sanitized.replace(/[ \t]+/g, " ");

  return sanitized.trim();
}
