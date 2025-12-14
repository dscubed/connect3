"use client";

import { ReactNode } from "react";
import { AuthHeader } from "./AuthHeader";
import { AuthIllustration, authIllustrationPreset } from "./AuthIllustration";
import type { IllustrationItem } from "./AuthIllustration";


export function AuthShell({
  children,
  items = authIllustrationPreset,
}: {
  children: ReactNode;
  items?: IllustrationItem[];
}) {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-[#c2b7ff] via-[#f0e5ff] to-[#ffbfd4] px-4 py-8 md:px-8 md:py-12">
      <div className="w-full max-w-6xl">
        <div className="rounded-[32px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)] px-6 py-8 md:px-12 md:py-10">
          {/* Header */}
          <AuthHeader />

          {/* Content */}
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            {/* Left: form */}
            <div className="w-full max-w-md">
              {children}
            </div>

            {/* Right: characters + stars */}
            <div className="hidden flex-1 justify-center md:flex">
              <AuthIllustration width={380} height={360} items={items} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
