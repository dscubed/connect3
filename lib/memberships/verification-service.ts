import { supabaseAdmin } from "@/lib/supabase/admin";
import { MembershipVerificationError } from "@/lib/memberships/errors";
import { normalizeEmail } from "@/lib/memberships/normalizers";
import { MembershipProductMatcher } from "@/lib/memberships/product-matcher";
import { MembershipRepository } from "@/lib/memberships/repository";
import { UmsuReceiptVerifier } from "@/lib/memberships/receipt-verifier";
import type {
  ClubMembershipUpsertRow,
  MembershipProductConfig,
  ProductMatch,
  VerifiedClubResult,
} from "@/lib/memberships/types";

export interface VerifyMembershipReceiptInput {
  userId: string;
  rawEmail: Buffer;
  clubId?: string;
}

export interface VerifyMembershipReceiptResult {
  boundEmail: string;
  referenceNumber: string;
  verifiedClub: VerifiedClubResult | null;
  verifiedClubs: VerifiedClubResult[];
  itemNames: string[];
}

export class MembershipVerificationService {
  constructor(
    private readonly repository = new MembershipRepository(supabaseAdmin),
    private readonly receiptVerifier = new UmsuReceiptVerifier(),
    private readonly productMatcher = new MembershipProductMatcher(),
  ) {}

  async verifyReceiptForUser({
    userId,
    rawEmail,
    clubId,
  }: VerifyMembershipReceiptInput): Promise<VerifyMembershipReceiptResult> {
    await this.assertStudentAccount(userId);

    const receipt = await this.receiptVerifier.verify(rawEmail);
    const verifiedEmail = normalizeEmail(receipt.toEmail);
    const referenceNumber = receipt.referenceNumber;

    if (!referenceNumber) {
      throw new MembershipVerificationError(
        "Receipt reference number could not be found in this .eml file",
        { status: 422 },
      );
    }

    await this.assertReceiptReferenceUnused(referenceNumber);

    const existingBinding = await this.repository.getEmailBinding(userId);
    const emailBinding =
      await this.repository.getEmailBindingByVerifiedEmail(verifiedEmail);

    if (existingBinding && existingBinding.verified_email !== verifiedEmail) {
      throw new MembershipVerificationError(
        "This account is already tied to a different UMSU receipt email",
        {
          status: 409,
          data: { boundEmail: existingBinding.verified_email },
        },
      );
    }

    if (emailBinding && emailBinding.user_id !== userId) {
      throw new MembershipVerificationError(
        "This UMSU receipt email is already tied to another Connect3 account",
        {
          status: 409,
          data: { boundEmail: verifiedEmail },
        },
      );
    }

    const products = await this.loadProducts(clubId);
    const matches = this.productMatcher.match(receipt, products);

    if (matches.length === 0) {
      throw new MembershipVerificationError(
        clubId
          ? "This UMSU receipt does not match this club membership"
          : "No registered club product matched this UMSU receipt",
        {
          status: 422,
          data: {
            boundEmail: existingBinding?.verified_email ?? verifiedEmail,
            itemNames: receipt.itemNames,
          },
        },
      );
    }

    await this.assertNoExistingMemberships(userId, matches);

    const verifiedAt = new Date().toISOString();

    if (!existingBinding) {
      await this.repository.createEmailBinding({
        user_id: userId,
        verified_email: verifiedEmail,
        dkim_domain: receipt.dkimDomain,
        dkim_selector: receipt.dkimSelector,
        first_message_id: receipt.messageId,
        first_verified_at: verifiedAt,
      });
    }

    await this.repository.createReceiptReference({
      reference_number: referenceNumber,
      user_id: userId,
      first_used_at: verifiedAt,
    });

    await this.repository.upsertClubMemberships(
      this.buildMembershipRows(
        userId,
        verifiedEmail,
        referenceNumber,
        verifiedAt,
        receipt,
        matches,
      ),
    );

    const verifiedClubs = await this.buildVerifiedClubResults(matches);

    return {
      boundEmail: verifiedEmail,
      referenceNumber,
      verifiedClub: verifiedClubs[0] ?? null,
      verifiedClubs,
      itemNames: receipt.itemNames,
    };
  }

  private async assertStudentAccount(userId: string): Promise<void> {
    const profile = await this.repository.getProfile(userId);

    if (!profile) {
      throw new MembershipVerificationError("Profile not found", {
        status: 404,
      });
    }

    if (profile.account_type === "organisation") {
      throw new MembershipVerificationError(
        "Organisation accounts cannot verify student membership",
        { status: 403 },
      );
    }
  }

  private async loadProducts(
    clubId?: string,
  ): Promise<MembershipProductConfig[]> {
    if (clubId) {
      const product = await this.repository.getEnabledProductForClub(clubId);

      if (!product) {
        throw new MembershipVerificationError(
          "This club is not accepting membership verification yet",
          { status: 422 },
        );
      }

      return [product];
    }

    const products = await this.repository.listEnabledProducts();
    if (products.length === 0) {
      throw new MembershipVerificationError(
        "No clubs are accepting membership verification yet",
        { status: 422 },
      );
    }

    return products;
  }

  private async assertReceiptReferenceUnused(
    referenceNumber: string,
  ): Promise<void> {
    const existingReference =
      await this.repository.getReceiptReferenceByNumber(referenceNumber);

    if (!existingReference) {
      return;
    }

    throw new MembershipVerificationError(
      "This .eml receipt has already been used",
      {
        status: 409,
        data: { referenceNumber },
      },
    );
  }

  private async assertNoExistingMemberships(
    userId: string,
    matches: ProductMatch[],
  ): Promise<void> {
    const clubIds = [...new Set(matches.map((match) => match.clubId))];
    const existingMemberships = await this.repository.getExistingClubMemberships(
      userId,
      clubIds,
    );

    if (existingMemberships.length === 0) {
      return;
    }

    const existingClubIds = new Set(
      existingMemberships.map((membership) => membership.club_id),
    );
    const duplicateMatches = matches.filter((match) =>
      existingClubIds.has(match.clubId),
    );
    const duplicateResults = await this.buildVerifiedClubResults(duplicateMatches);
    const duplicateNames = duplicateResults
      .map((result) => result.club?.first_name ?? "This club")
      .filter((name, index, values) => values.indexOf(name) === index);

    throw new MembershipVerificationError(
      duplicateNames.length === 1
        ? `${duplicateNames[0]} is already verified for this account`
        : "One or more matched clubs are already verified for this account",
      {
        status: 409,
        data: {
          verifiedClubs: duplicateResults,
        },
      },
    );
  }

  private buildMembershipRows(
    userId: string,
    verifiedEmail: string,
    referenceNumber: string,
    verifiedAt: string,
    receipt: Awaited<ReturnType<UmsuReceiptVerifier["verify"]>>,
    matches: ProductMatch[],
  ): ClubMembershipUpsertRow[] {
    return matches.map((match) => ({
      club_id: match.clubId,
      user_id: userId,
      verified_email: verifiedEmail,
      receipt_reference_number: referenceNumber,
      matched_product_name: match.productName,
      matched_receipt_item_name: match.matchedItemName,
      dkim_domain: receipt.dkimDomain,
      dkim_selector: receipt.dkimSelector,
      message_id: receipt.messageId,
      receipt_subject: receipt.subject,
      receipt_sent_at: receipt.sentAt,
      verified_at: verifiedAt,
    }));
  }

  private async buildVerifiedClubResults(
    matches: ProductMatch[],
  ): Promise<VerifiedClubResult[]> {
    const clubIds = [...new Set(matches.map((match) => match.clubId))];
    const clubs = await this.repository.getClubSummaries(clubIds);

    return matches.map((match) => ({
      club_id: match.clubId,
      club: clubs.find((club) => club.id === match.clubId) ?? null,
      matchedProductName: match.productName,
      matchedReceiptItemName: match.matchedItemName,
    }));
  }
}
