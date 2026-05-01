import { simpleParser, type AddressObject } from "mailparser";
import { normalizeEmail } from "@/lib/memberships/normalizers";
import type { ParsedReceiptContent } from "@/lib/memberships/types";

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"');
}

function firstAddress(address: AddressObject | AddressObject[] | undefined) {
  const value = Array.isArray(address) ? address[0] : address;
  return value?.value?.[0]?.address ?? null;
}

export function extractReceiptItemNames(text: string): string[] {
  const names = new Set<string>();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  for (const line of lines) {
    const match = line.match(/\bitem\s*:\s*(.+)$/i);
    if (!match) continue;

    const value = match[1]
      .replace(/\s+(qty|quantity|price|amount|total)\s*:.*$/i, "")
      .trim();
    if (value) names.add(value);
  }

  return [...names];
}

function normalizeReferenceNumber(value: string): string {
  return value
    .replace(/^[#\s]+/, "")
    .replace(/[.,;:)\]]+$/, "")
    .trim()
    .toUpperCase();
}

export function extractReceiptReferenceNumber(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const patterns = [
    /\b(?:your\s+)?(?:receipt\s+)?reference\s*(?:number|no\.?|#)\s*(?:is|[:#-])?\s*([a-z0-9][a-z0-9._/-]{2,})\b/i,
    /\b(?:your\s+)?(?:receipt\s+)?reference\s*(?:is|[:#-])\s*([a-z0-9][a-z0-9._/-]{2,})\b/i,
    /\bref(?:erence)?\s*(?:number|no\.?|#)\s*(?:is|[:#-])?\s*([a-z0-9][a-z0-9._/-]{2,})\b/i,
    /\bref\s*[:#-]\s*([a-z0-9][a-z0-9._/-]{2,})\b/i,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      const referenceNumber = match?.[1]
        ? normalizeReferenceNumber(match[1])
        : "";

      if (referenceNumber) {
        return referenceNumber;
      }
    }
  }

  return null;
}

export class UmsuReceiptParser {
  async parse(rawEmail: Buffer): Promise<ParsedReceiptContent> {
    const parsed = await simpleParser(rawEmail);
    const toEmail = firstAddress(parsed.to);

    if (!toEmail) {
      throw new Error("Receipt does not include a To email address");
    }

    const textBody = [
      parsed.text ?? "",
      parsed.html ? htmlToText(String(parsed.html)) : "",
    ]
      .join("\n")
      .replace(/\r/g, "");
    const referenceSearchText = [parsed.subject ?? "", textBody].join("\n");

    return {
      toEmail: normalizeEmail(toEmail),
      messageId: parsed.messageId ?? null,
      subject: parsed.subject ?? null,
      sentAt: parsed.date ? parsed.date.toISOString() : null,
      itemNames: extractReceiptItemNames(textBody),
      referenceNumber: extractReceiptReferenceNumber(referenceSearchText),
      textBody,
    };
  }
}
