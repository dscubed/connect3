import { dkimVerify } from "mailauth";
import { verifyASChain } from "mailauth/lib/arc";
import {
  TRUSTED_ARC_SEALERS,
  UMSU_DKIM_DOMAIN,
} from "@/lib/memberships/constants";
import { normalizeProductName } from "@/lib/memberships/normalizers";
import type { DkimSignatureEvidence } from "@/lib/memberships/types";

interface DkimResultLike {
  signingDomain?: string;
  selector?: string;
  signingHeaders?: { keys?: unknown };
  status?: { result?: string; comment?: string; header?: { s?: string } };
}

interface ArcAuthDkimResult {
  value?: string;
  result?: string;
  header?: {
    d?: string;
    i?: string;
    s?: string;
  };
}

interface ArcChainEntryLike {
  i?: number;
  "arc-seal"?: {
    parsed?: {
      d?: {
        value?: string;
      };
    };
  };
  "arc-authentication-results"?: {
    parsed?: {
      dkim?: ArcAuthDkimResult[];
    };
  };
}

interface ArcDataLike {
  error?: Error;
  chain?: ArcChainEntryLike[];
  lastEntry?: {
    i?: number;
    messageSignature?: {
      signingDomain?: string;
      selector?: string;
      status?: { result?: string; comment?: string };
    };
    "arc-seal"?: {
      parsed?: {
        d?: {
          value?: string;
        };
      };
    };
  };
}

export class UmsuDkimVerifier {
  async verify(rawEmail: Buffer): Promise<DkimSignatureEvidence> {
    const dkim = await dkimVerify(rawEmail);
    const results = (dkim.results ?? []) as DkimResultLike[];
    const passed = results.find((result) => this.isTrustedUmsuResult(result));

    if (!passed) {
      console.error("membership_dkim_verify_failed_direct", {
        dkimResults: results.map((result) => ({
          signingDomain: result.signingDomain ?? null,
          selector: result.selector ?? result.status?.header?.s ?? null,
          status: result.status?.result ?? null,
          comment: result.status?.comment ?? null,
          signedHeaders: this.signedHeadersFor(result),
        })),
      });
      const recovered = await this.recoverTrustedArcResult(dkim.arc);
      if (!recovered) {
        throw new Error(this.failureMessage(results));
      }

      return recovered;
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

  private async recoverTrustedArcResult(
    arcData: unknown,
  ): Promise<DkimSignatureEvidence | null> {
    const parsedArcData = arcData as ArcDataLike | null;

    if (!parsedArcData) {
      console.error("membership_arc_missing");
      return null;
    }

    let hasValidArcChain = false;
    try {
      hasValidArcChain = await verifyASChain(parsedArcData as never, {});
      console.error("membership_arc_verify_as_chain", {
        hasValidArcChain,
      });
    } catch (error) {
      console.error("membership_arc_verify_as_chain_error", {
        name: error instanceof Error ? error.name : null,
        message: error instanceof Error ? error.message : String(error),
        code:
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          typeof (error as { code?: unknown }).code === "string"
            ? (error as { code: string }).code
            : null,
        queryDomain:
          typeof error === "object" &&
          error !== null &&
          "queryDomain" in error &&
          typeof (error as { queryDomain?: unknown }).queryDomain === "string"
            ? (error as { queryDomain: string }).queryDomain
            : null,
      });
      return null;
    }

    console.error("membership_arc_debug", {
      arcDataError:
        parsedArcData.error
          ? {
              name: parsedArcData.error?.name ?? null,
              message: parsedArcData.error?.message ?? null,
            }
          : null,
      lastEntry:
        parsedArcData.lastEntry
          ? {
              i: parsedArcData.lastEntry?.i ?? null,
              sealerDomain:
                parsedArcData.lastEntry?.["arc-seal"]?.parsed?.d?.value ?? null,
              messageSignatureDomain:
                parsedArcData.lastEntry?.messageSignature?.signingDomain ?? null,
              messageSignatureSelector:
                parsedArcData.lastEntry?.messageSignature?.selector ?? null,
              messageSignatureStatus:
                parsedArcData.lastEntry?.messageSignature?.status?.result ?? null,
              messageSignatureComment:
                parsedArcData.lastEntry?.messageSignature?.status?.comment ?? null,
            }
          : null,
      hasValidArcChain,
      chain:
        parsedArcData.chain?.map((entry) => ({
          i: entry.i ?? null,
          sealDomain: entry["arc-seal"]?.parsed?.d?.value ?? null,
          dkim:
            entry["arc-authentication-results"]?.parsed?.dkim?.map((result) => ({
              value: result.value ?? null,
              result: result.result ?? null,
              headerD: result.header?.d ?? null,
              headerI: result.header?.i ?? null,
              headerS: result.header?.s ?? null,
            })) ?? [],
        })) ?? [],
    });

    if (!hasValidArcChain) {
      return null;
    }

    const sealerDomain = normalizeProductName(
      parsedArcData.lastEntry?.["arc-seal"]?.parsed?.d?.value ?? "",
    );
    if (!TRUSTED_ARC_SEALERS.includes(sealerDomain)) {
      return null;
    }

    if (parsedArcData.lastEntry?.messageSignature?.status?.result !== "pass") {
      return null;
    }

    const trustedDkim = this.findTrustedArcDkimResult(parsedArcData);

    if (!trustedDkim) {
      return null;
    }

    return {
      dkimDomain: UMSU_DKIM_DOMAIN,
      dkimSelector:
        trustedDkim.header?.s ??
        parsedArcData.lastEntry?.messageSignature?.selector ??
        null,
      signedHeaders: ["to"],
    };
  }

  private findTrustedArcDkimResult(
    arcData: ArcDataLike,
  ): ArcAuthDkimResult | null {
    const chainEntries = Array.isArray(arcData.chain)
      ? [...arcData.chain].sort((a, b) => (b.i ?? 0) - (a.i ?? 0))
      : [];

    for (const entry of chainEntries) {
      const entrySealer = normalizeProductName(
        entry["arc-seal"]?.parsed?.d?.value ?? "",
      );
      if (!TRUSTED_ARC_SEALERS.includes(entrySealer)) {
        continue;
      }

      const trustedDkim = (entry["arc-authentication-results"]?.parsed?.dkim ??
        []).find((result) =>
        (result.result ?? result.value) === "pass" &&
        normalizeProductName(
          result.header?.d ?? result.header?.i?.replace(/^@/, "") ?? "",
        ) === UMSU_DKIM_DOMAIN,
      );

      if (trustedDkim) {
        return trustedDkim;
      }
    }
    return null;
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
