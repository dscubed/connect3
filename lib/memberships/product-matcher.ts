import { normalizeProductName } from "@/lib/memberships/normalizers";
import type {
  DkimReceiptVerification,
  MembershipProductConfig,
  ProductMatch,
} from "@/lib/memberships/types";

export class MembershipProductMatcher {
  match(
    verification: DkimReceiptVerification,
    products: MembershipProductConfig[],
  ): ProductMatch[] {
    const body = normalizeProductName(verification.textBody);
    const normalizedItems = verification.itemNames.map((itemName) => ({
      itemName,
      normalized: normalizeProductName(itemName),
    }));

    const matches: ProductMatch[] = [];
    for (const product of products) {
      const itemMatch = normalizedItems.find(
        (item) => item.normalized === product.normalized_product_name,
      );
      if (itemMatch) {
        matches.push({
          clubId: product.club_id,
          productName: product.product_name,
          normalizedProductName: product.normalized_product_name,
          matchedItemName: itemMatch.itemName,
        });
        continue;
      }

      if (body.includes(product.normalized_product_name)) {
        matches.push({
          clubId: product.club_id,
          productName: product.product_name,
          normalizedProductName: product.normalized_product_name,
          matchedItemName: product.product_name,
        });
      }
    }

    return matches;
  }
}
