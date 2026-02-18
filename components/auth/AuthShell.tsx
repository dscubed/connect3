"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthIllustrationImage } from "@/components/illustration/AuthIllustrationImage";

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
        "p-4 sm:p-6 md:p-10",
        className,
      )}
    >
      <div className="mx-auto flex flex-1 max-w-[1400px] items-center justify-center">
        {/* Big white box */}
        <div className="w-full max-w-[1200px] overflow-hidden rounded-[28px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
          {/* Make sure the panel has a nice height on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[650px]">
            {/* LEFT */}
            <div className="px-6 py-6 sm:px-10 sm:py-8 md:px-14 md:py-10">
              <AuthHeader className="mb-6" />
              {children}
            </div>

            {/* RIGHT (fills full column, no constraints) */}
            {/* Hide on small screens */}
            <div className="relative hidden lg:block h-full w-full">
              <AuthIllustrationImage />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
