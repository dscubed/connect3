"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <button
      onClick={logout}
      className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/5 transition-all hover:scale-105"
    >
      log out
    </button>
  );
}
