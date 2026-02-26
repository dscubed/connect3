/**
 * Edge-compatible HMAC signing for admin session cookies.
 * Uses Web Crypto API (available in both Edge runtime and Node.js 18+).
 */

const ALGORITHM = { name: "HMAC", hash: "SHA-256" } as const;
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8; // 8 hours
export const ADMIN_COOKIE_NAME = "admin_token";

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET env var is not set");
  return secret;
}

async function getKey(usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    ALGORITHM,
    false,
    usage,
  );
}

function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToUint8Array(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

function b64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64urlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded);
}

export async function createAdminToken(email: string): Promise<string> {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = `${email}|${expires}`;
  const key = await getKey(["sign"]);
  const sigBuffer = await crypto.subtle.sign(
    ALGORITHM,
    key,
    new TextEncoder().encode(payload),
  );
  const sig = uint8ArrayToHex(new Uint8Array(sigBuffer));
  return `${b64urlEncode(payload)}.${sig}`;
}

export async function verifyAdminToken(
  token: string,
): Promise<{ email: string } | null> {
  try {
    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) return null;

    const payloadB64 = token.slice(0, dotIndex);
    const sig = token.slice(dotIndex + 1);

    const payload = b64urlDecode(payloadB64);
    const [email, expiresStr] = payload.split("|");

    if (!email || !expiresStr) return null;
    if (Date.now() > parseInt(expiresStr)) return null;

    const key = await getKey(["verify"]);
    const isValid = await crypto.subtle.verify(
      ALGORITHM,
      key,
      hexToUint8Array(sig).buffer as ArrayBuffer,
      new TextEncoder().encode(payload),
    );

    return isValid ? { email } : null;
  } catch {
    return null;
  }
}
