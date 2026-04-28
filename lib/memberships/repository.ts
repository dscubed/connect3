import type { SupabaseClient } from "@supabase/supabase-js";
import { MembershipVerificationError } from "@/lib/memberships/errors";
import type {
  ClubMembershipUpsertRow,
  ClubSummary,
  MembershipEmailBinding,
  MembershipProductConfig,
  MembershipProfile,
} from "@/lib/memberships/types";

export class MembershipRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getProfile(userId: string): Promise<MembershipProfile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, account_type")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw new MembershipVerificationError(error.message, { status: 500 });
    }

    return data as MembershipProfile | null;
  }

  async getEmailBinding(
    userId: string,
  ): Promise<MembershipEmailBinding | null> {
    const { data, error } = await this.supabase
      .from("membership_email_bindings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new MembershipVerificationError(error.message, { status: 500 });
    }

    return data as MembershipEmailBinding | null;
  }

  async getEmailBindingByVerifiedEmail(
    verifiedEmail: string,
  ): Promise<MembershipEmailBinding | null> {
    const { data, error } = await this.supabase
      .from("membership_email_bindings")
      .select("*")
      .eq("verified_email", verifiedEmail)
      .maybeSingle();

    if (error) {
      throw new MembershipVerificationError(error.message, { status: 500 });
    }

    return data as MembershipEmailBinding | null;
  }

  async createEmailBinding(input: MembershipEmailBinding): Promise<void> {
    const { error } = await this.supabase
      .from("membership_email_bindings")
      .insert(input);

    if (error) {
      if (
        error.code === "23505" &&
        error.message.includes(
          "membership_email_bindings_verified_email_lower_key",
        )
      ) {
        throw new MembershipVerificationError(
          "This UMSU receipt email is already tied to another Connect3 account",
          { status: 409, data: { boundEmail: input.verified_email } },
        );
      }

      throw new MembershipVerificationError(error.message, { status: 500 });
    }
  }

  async getEnabledProductForClub(
    clubId: string,
  ): Promise<MembershipProductConfig | null> {
    const { data, error } = await this.supabase
      .from("club_membership_products")
      .select("club_id, product_name, normalized_product_name")
      .eq("club_id", clubId)
      .eq("enabled", true)
      .neq("normalized_product_name", "")
      .maybeSingle();

    if (error) {
      throw new MembershipVerificationError(error.message, { status: 500 });
    }

    return data as MembershipProductConfig | null;
  }

  async listEnabledProducts(): Promise<MembershipProductConfig[]> {
    const { data, error } = await this.supabase
      .from("club_membership_products")
      .select("club_id, product_name, normalized_product_name")
      .eq("enabled", true)
      .neq("normalized_product_name", "");

    if (error) {
      throw new MembershipVerificationError(error.message, { status: 500 });
    }

    return (data ?? []) as MembershipProductConfig[];
  }

  async upsertClubMemberships(rows: ClubMembershipUpsertRow[]): Promise<void> {
    const { error } = await this.supabase
      .from("club_memberships")
      .upsert(rows, { onConflict: "club_id,user_id" });

    if (error) {
      throw new MembershipVerificationError(error.message, { status: 500 });
    }
  }

  async getClubSummaries(clubIds: string[]): Promise<ClubSummary[]> {
    if (clubIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, first_name, avatar_url")
      .in("id", clubIds);

    if (error) {
      throw new MembershipVerificationError(error.message, { status: 500 });
    }

    return (data ?? []) as ClubSummary[];
  }
}
