"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogIn, User, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthDropdownButton } from "./AuthDropdownButton";

export function LoggedOutAuthButton() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleSignUp = () => {
    router.push("/auth/sign-up");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center w-10 h-10 rounded-full text-muted hover:text-black hover:bg-muted/15 hover:scale-105 transition-all focus:outline-none">
          <User className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="right"
        className="w-44 rounded-xl border border-muted/20 bg-white shadow-lg p-1"
      >
        <AuthDropdownButton
          onClick={handleLogin}
          text="Log In"
          icon={<LogIn className="w-4 h-4" />}
        />
        <AuthDropdownButton
          onClick={handleSignUp}
          text="Sign Up"
          icon={<UserPlus className="w-4 h-4" />}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
