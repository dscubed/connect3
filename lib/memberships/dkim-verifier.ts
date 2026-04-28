import { dkimVerify } from "mailauth";
import { UMSU_DKIM_DOMAIN } from "@/lib/memberships/constants";
import { normalizeProductName } from "@/lib/memberships/normalizers";
import type { DkimSignatureEvidence } from "@/lib/memberships/types";

interface DkimResultLike {
  signingDomain?: string;
  selector?: string;
  signingHeaders?: { keys?: unknown };
  status?: { result?: string; comment?: string; header?: { s?: string } };
}

export class UmsuDkimVerifier {
  async verify(rawEmail: Buffer): Promise<DkimSignatureEvidence> {
    const dkim = await dkimVerify(rawEmail);
    const results = (dkim.results ?? []) as DkimResultLike[];
    const passed = results.find((result) => this.isTrustedUmsuResult(result));

    if (!passed) {
      throw new Error(this.failureMessage(results));
    }

    return {
      dkimDomain: passed.signingDomain ?? UMSU_DKIM_DOMAIN,
      dkimSelector: passed.selector ?? passed.status?.header?.s ?? null,
      signedHeaders: this.signedHeadersFor(passed),
    };
  }

  private isTrustedUmsuResult(result: DkimResultLike): boolean {
    const signedHeaders = this.signedHeadersFor(result);

    return (
      result.status?.result === "pass" &&
      normalizeProductName(result.signingDomain ?? "") === UMSU_DKIM_DOMAIN &&
      signedHeaders.some((header) => header.toLowerCase() === "to")
    );
  }

  private signedHeadersFor(result: DkimResultLike): string[] {
    const keys = result.signingHeaders?.keys;

    if (Array.isArray(keys)) {
      return keys
        .filter((key): key is string => typeof key === "string")
        .map((key) => key.trim())
        .filter(Boolean);
    }

    if (typeof keys === "string") {
      return keys
        .split(":")
        .map((key) => key.trim())
        .filter(Boolean);
    }

    return [];
  }

  private failureMessage(results: DkimResultLike[]): string {
    const details = results
      .map((result) => {
        const domain = result.signingDomain ?? "unknown domain";
        const status = result.status?.result ?? "unknown";
        const comment = result.status?.comment
          ? ` (${result.status.comment})`
          : "";
        return `${domain}: ${status}${comment}`;
      })
      .join("; ");

    return details
      ? `No valid UMSU DKIM signature signed the To header. ${details}`
      : "No valid UMSU DKIM signature signed the To header";
  }
}
