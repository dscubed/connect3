import { MAX_RECEIPT_BYTES } from "@/lib/memberships/constants";
import { UmsuDkimVerifier } from "@/lib/memberships/dkim-verifier";
import { UmsuReceiptParser } from "@/lib/memberships/receipt-parser";
import type { DkimReceiptVerification } from "@/lib/memberships/types";

export class UmsuReceiptVerifier {
  constructor(
    private readonly dkimVerifier = new UmsuDkimVerifier(),
    private readonly parser = new UmsuReceiptParser(),
  ) {}

  async verify(rawEmail: Buffer): Promise<DkimReceiptVerification> {
    if (rawEmail.byteLength === 0) {
      throw new Error("Receipt file is empty");
    }
    if (rawEmail.byteLength > MAX_RECEIPT_BYTES) {
      throw new Error("Receipt file is too large");
    }

    const dkimEvidence = await this.dkimVerifier.verify(rawEmail);
    const receiptContent = await this.parser.parse(rawEmail);

    return {
      ...receiptContent,
      ...dkimEvidence,
    };
  }
}
