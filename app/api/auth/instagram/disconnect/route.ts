import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Perform the "Soft Disconnect"
    // We update the record associated with this user's profile_id
    // We set is_connected to false and clear the tokens
    // We intentionally leave last_synced_at alone to preserve history for "Smart Reconnect"
    // Smart Reconnect will allow for reconnection without syncing same data again
    const { error } = await supabase
      .from("instagram_accounts")
      .update({
        is_connected: false,
        access_token: null,
        token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", user.id);

    if (error) {
      console.error("Error disconnecting Instagram account:", error);
      return NextResponse.json(
        { error: "Failed to disconnect account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in disconnect route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
