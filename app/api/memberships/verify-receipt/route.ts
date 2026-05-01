import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MembershipVerificationError } from "@/lib/memberships/errors";
import { ReceiptUploadValidator } from "@/lib/memberships/upload-validator";
import { MembershipVerificationService } from "@/lib/memberships/verification-service";

export const runtime = "nodejs";

const receiptUploadValidator = new ReceiptUploadValidator();
const membershipVerificationService = new MembershipVerificationService();

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const clubId = String(form.get("club_id") ?? "").trim() || undefined;
    const file = receiptUploadValidator.validate(form.get("receipt"));
    const rawEmail = Buffer.from(await file.arrayBuffer());

    return NextResponse.json({
      data: await membershipVerificationService.verifyReceiptForUser({
        userId: user.id,
        rawEmail,
        clubId,
      }),
    });
  } catch (error) {
    console.error("POST /api/memberships/verify-receipt error:", error);
    if (error instanceof MembershipVerificationError) {
      return NextResponse.json(
        {
          error: error.message,
          ...(error.data ? { data: error.data } : {}),
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify UMSU receipt",
      },
      { status: 400 },
    );
  }
}
