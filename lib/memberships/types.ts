export interface MembershipProductConfig {
  club_id: string;
  product_name: string;
  normalized_product_name: string;
}

export interface DkimSignatureEvidence {
  dkimDomain: string;
  dkimSelector: string | null;
  signedHeaders: string[];
}

export interface ParsedReceiptContent {
  toEmail: string;
  messageId: string | null;
  subject: string | null;
  sentAt: string | null;
  itemNames: string[];
  referenceNumber: string | null;
  textBody: string;
}

export type DkimReceiptVerification = ParsedReceiptContent &
  DkimSignatureEvidence;

export interface ProductMatch {
  clubId: string;
  productName: string;
  normalizedProductName: string;
  matchedItemName: string;
}

export interface MembershipEmailBinding {
  user_id: string;
  verified_email: string;
  dkim_domain: string;
  dkim_selector: string | null;
  first_message_id: string | null;
  first_verified_at: string;
}

export interface MembershipProfile {
  id: string;
  account_type: string | null;
}

export interface ClubSummary {
  id: string;
  first_name: string | null;
  avatar_url: string | null;
}

export interface ClubMembershipUpsertRow {
  club_id: string;
  user_id: string;
  verified_email: string;
  receipt_reference_number: string;
  matched_product_name: string;
  matched_receipt_item_name: string;
  dkim_domain: string;
  dkim_selector: string | null;
  message_id: string | null;
  receipt_subject: string | null;
  receipt_sent_at: string | null;
  verified_at: string;
}

export interface ExistingClubMembership {
  club_id: string;
  user_id: string;
}

export interface MembershipReceiptReference {
  reference_number: string;
  user_id: string;
  first_used_at: string;
}

export interface VerifiedClubResult {
  club_id: string;
  club: ClubSummary | null;
  matchedProductName: string;
  matchedReceiptItemName: string;
}
