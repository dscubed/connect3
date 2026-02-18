"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/search/MatchResult/UserAvatar";
import { AuthDropdownButton } from "./AuthDropdownButton";

export function LoggedInAuthButton() {
  const router = useRouter();
  const { profile, signOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:scale-105 transition-transform focus:outline-none overflow-hidden">
          <UserAvatar
            avatarUrl={profile?.avatar_url}
            fullName={profile?.first_name || "User"}
            userId={profile?.id || ""}
            size="sm"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="right"
        className="w-44 rounded-xl border border-black/10 bg-white shadow-lg p-1"
      >
        <AuthDropdownButton
          onClick={handleProfile}
          text="Profile"
          icon={<User className="w-4 h-4" />}
        />

        <AuthDropdownButton
          onClick={handleLogout}
          text="Log Out"
          icon={<LogOut className="w-4 h-4" />}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
