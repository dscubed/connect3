import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { regenerateTldr } from "@/lib/users/regenerateTldr";

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;
  const { userId } = await req.json();

  if (!userId || userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // background, don’t block UI
  regenerateTldr(userId).catch(console.error);

  return NextResponse.json({ success: true });
}
