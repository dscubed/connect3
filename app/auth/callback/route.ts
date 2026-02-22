import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (user.user_metadata?.anonymousId) {
          try {
            await supabase.rpc("migrate_anonymous_user_data", {
              old_anonymous_id: user.user_metadata.anonymousId,
              new_user_id: user.id,
            });
            await supabase.auth.updateUser({
              data: { anonymousId: null },
            });
          } catch (err) {
            console.error("Failed to migrate anonymous data:", err);
          }
        }

        return NextResponse.redirect(`${origin}${next ?? "/"}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
