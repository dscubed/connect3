"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export function LogoutButton() {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);

  const logout = async () => {
    console.log("Logout button clicked");
    try {
      await signOut();
      console.log("signOut called successfully");
      router.push("/");
      console.log("Router pushed to /");
    } catch (err) {
      console.error("Error during logout:", err);
    }
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
