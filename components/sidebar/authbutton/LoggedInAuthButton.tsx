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
import Image from "next/image";
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
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:scale-105 transition-transform focus:outline-none">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Avatar"
              width={40}
              height={40}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium">
              {profile?.first_name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
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
