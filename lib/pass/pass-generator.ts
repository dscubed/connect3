import { createCipheriv, createDecipheriv, createHmac } from "crypto";
import { PKPass } from "passkit-generator";
import jwt from "jsonwebtoken";

export const CLUB_CONFIG = {
  id: "data-science-student-society",
  displayName: "Data Science Student Society",
  googleClassIdSuffix: "club-pass-v1",
  logoUrl: "https://c3-pass-assets.vercel.app/clubs/dscubed-logo.png",
};

export interface PassData {
  name: string;
  email: string;
  userId: string;
  memberId: string;
}

export function encryptMemberData(
  name: string,
  email: string,
  userId: string,
): string {
  const secret = process.env.PASS_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("PASS_ENCRYPTION_SECRET is not set");
  }

  const key = Buffer.from(secret, "hex"); // 32 bytes for aes-256
  const iv = createHmac("sha256", key)
    .update(`${name}:${email}:${userId}`)
    .digest()
    .subarray(0, 16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);

  const payload = JSON.stringify({ name, email, userId });
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decryptMemberData(memberId: string): {
  name: string;
  email: string;
  userId: string;
} {
  const secret = process.env.PASS_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("PASS_ENCRYPTION_SECRET is not set");
  }

  const [ivHex, encryptedHex] = memberId.split(":");
  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid member ID format");
  }

  const key = Buffer.from(secret, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", key, iv);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}

// --- Apple Wallet ---

async function fetchImageAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

export async function generateApplePass(data: PassData): Promise<Buffer | null> {
  const formatKey = (key: string | undefined) =>
    key ? key.replace(/\\n/g, "\n") : undefined;

  const signerCert = formatKey(process.env.APPLE_WALLET_SIGNER_CERT);
  const signerKey = formatKey(process.env.APPLE_WALLET_PRIVATE_KEY);
  const wwdr = formatKey(process.env.APPLE_WALLET_WWDR_CERT);
  const passTypeIdentifier = process.env.APPLE_WALLET_PASS_TYPE_ID;
  const teamIdentifier = process.env.APPLE_WALLET_TEAM_ID;

  if (!signerCert || !signerKey || !wwdr || !passTypeIdentifier || !teamIdentifier) {
    console.warn("Missing Apple Wallet configuration — skipping Apple pass generation");
    return null;
  }

  const pass: any = new PKPass(
    {},
    { signerCert, signerKey, wwdr },
  );

  pass.type = "storeCard";
  pass.passTypeIdentifier = passTypeIdentifier;
  pass.teamIdentifier = teamIdentifier;
  pass.serialNumber = data.memberId;
  pass.organizationName = CLUB_CONFIG.displayName;
  pass.description = `Membership Pass for ${CLUB_CONFIG.displayName}`;
  pass.logoText = CLUB_CONFIG.displayName;

  pass.backgroundColor = "rgb(219, 213, 255)";
  pass.foregroundColor = "rgb(0, 0, 0)";
  pass.labelColor = "rgb(60, 60, 60)";

  pass.primaryFields.add({
    key: "name",
    label: "Name",
    value: data.name,
  });

  pass.barcodes = [
    {
      format: "PKBarcodeFormatQR",
      message: data.memberId,
      messageEncoding: "iso-8859-1",
      altText: data.memberId,
    },
  ];

  if (CLUB_CONFIG.logoUrl) {
    const logoBuffer = await fetchImageAsBuffer(CLUB_CONFIG.logoUrl);
    if (logoBuffer) {
      pass.addBuffer("logo.png", logoBuffer);
      pass.addBuffer("logo@2x.png", logoBuffer);
      pass.addBuffer("icon.png", logoBuffer);
      pass.addBuffer("icon@2x.png", logoBuffer);
    }
  }

  const footerUrl = "https://c3-pass-assets.vercel.app/google-wallet/footer-v2.png";
  const stripBuffer = await fetchImageAsBuffer(footerUrl);
  if (stripBuffer) {
    pass.addBuffer("strip.png", stripBuffer);
    pass.addBuffer("strip@2x.png", stripBuffer);
  }

  return await pass.asBuffer();
}

// --- Google Wallet ---

export function generateGooglePassUrl(data: PassData): string | null {
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_WALLET_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const issuerId = process.env.GOOGLE_ISSUER_ID || process.env.GOOGLE_WALLET_ISSUER_ID;

  if (!privateKey || !serviceAccountEmail || !issuerId) {
    console.warn("Missing Google Wallet configuration — skipping Google pass generation");
    return null;
  }

  const payload = {
    iss: serviceAccountEmail,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [],
    payload: {
      genericObjects: [
        {
          id: `${issuerId}.${data.memberId.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
          classId: `${issuerId}.${CLUB_CONFIG.googleClassIdSuffix}`,
          logo: {
            sourceUri: { uri: CLUB_CONFIG.logoUrl },
            contentDescription: {
              defaultValue: { language: "en-US", value: "Club Logo" },
            },
          },
          cardTitle: {
            defaultValue: { language: "en-US", value: CLUB_CONFIG.displayName },
          },
          subheader: {
            defaultValue: { language: "en-US", value: "Name" },
          },
          header: {
            defaultValue: { language: "en-US", value: data.name },
          },
          textModulesData: [],
          barcode: {
            type: "QR_CODE",
            value: data.memberId,
            alternateText: CLUB_CONFIG.displayName,
          },
          hexBackgroundColor: "#dbd5ff",
          heroImage: {
            sourceUri: {
              uri: "https://c3-pass-assets.vercel.app/google-wallet/footer-v2.png",
            },
            contentDescription: {
              defaultValue: { language: "en-US", value: "Footer Image" },
            },
          },
        },
      ],
    },
  };

  const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
  return `https://pay.google.com/gp/v/save/${token}`;
}
