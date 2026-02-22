"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AuthHeader } from "@/components/auth/AuthHeader";

type AuthShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <main
      className={cn(
        "flex min-h-svh w-full",
        "bg-gradient-to-br from-[#c2b7ff] via-[#f0e5ff] to-[#ffbfd4]",
        "p-4",
        className,
      )}
    >
      <div className="mx-auto flex flex-1 max-w-[1400px] items-center justify-center">
        <div className="w-full max-w-[480px] overflow-hidden rounded-[28px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
          <div className="px-4 sm:px-6 py-6">
            <AuthHeader className="mb-4" />
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
