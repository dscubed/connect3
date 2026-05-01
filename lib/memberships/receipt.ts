import { MembershipProductMatcher } from "@/lib/memberships/product-matcher";
import { UmsuReceiptVerifier } from "@/lib/memberships/receipt-verifier";
import type {
  DkimReceiptVerification,
  MembershipProductConfig,
  ProductMatch,
} from "@/lib/memberships/types";

export {
  MAX_RECEIPT_BYTES,
  UMSU_DKIM_DOMAIN,
} from "@/lib/memberships/constants";
export {
  normalizeEmail,
  normalizeProductName,
} from "@/lib/memberships/normalizers";
export {
  extractReceiptItemNames,
  extractReceiptReferenceNumber,
  UmsuReceiptParser,
} from "@/lib/memberships/receipt-parser";
export { UmsuDkimVerifier } from "@/lib/memberships/dkim-verifier";
export { UmsuReceiptVerifier } from "@/lib/memberships/receipt-verifier";
export { MembershipProductMatcher } from "@/lib/memberships/product-matcher";
export type {
  DkimReceiptVerification,
  MembershipProductConfig,
  ProductMatch,
} from "@/lib/memberships/types";

export async function verifyUmsuReceipt(
  rawEmail: Buffer,
): Promise<DkimReceiptVerification> {
  return new UmsuReceiptVerifier().verify(rawEmail);
}

export function matchMembershipProducts(
  verification: DkimReceiptVerification,
  products: MembershipProductConfig[],
): ProductMatch[] {
  return new MembershipProductMatcher().match(verification, products);
}
