import { MAX_RECEIPT_BYTES } from "@/lib/memberships/constants";
import { MembershipVerificationError } from "@/lib/memberships/errors";

export class ReceiptUploadValidator {
  validate(receipt: FormDataEntryValue | null): File {
    if (!(receipt instanceof File)) {
      throw new MembershipVerificationError("Upload a .eml receipt file");
    }

    if (receipt.size > MAX_RECEIPT_BYTES) {
      throw new MembershipVerificationError("Receipt file is too large");
    }

    if (!receipt.name.toLowerCase().endsWith(".eml")) {
      throw new MembershipVerificationError("Receipt must be a .eml file");
    }

    return receipt;
  }
}
