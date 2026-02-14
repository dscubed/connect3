"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type FormShellProps = {
  children: React.ReactNode;
  className?: string;
  illustration?: React.ReactNode;
  title: string;
  subtitle?: string;
  backLink?: {
    href: string;
    label: string;
  };
};

export function FormShell({
  children,
  className,
  illustration,
  title,
  subtitle,
  backLink,
}: FormShellProps) {
  return (
    <main
      className={cn(
        "min-h-svh w-full",
        "bg-gradient-to-br from-[#c2b7ff] via-[#f0e5ff] to-[#ffbfd4]",
        "p-4 sm:p-6 md:p-10",
        className,
      )}
    >
      <div className="mx-auto flex min-h-svh w-full max-w-[1400px] items-center justify-center">
        {/* Big white box */}
        <div className="w-full max-w-[1200px] overflow-hidden rounded-[28px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
          {/* Make sure the panel has a nice height on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[650px]">
            {/* LEFT */}
            <div className="px-6 py-6 sm:px-10 sm:py-8 md:px-14 md:py-10">
              {backLink && (
                <Link
                  href={backLink.href}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                  <ArrowLeft size={20} />
                  {backLink.label}
                </Link>
              )}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-gray-600">{subtitle}</p>
                )}
              </div>
              {children}
            </div>

            {/* RIGHT (fills full column, no constraints) */}
            {/* Hide on small screens */}
            {illustration && (
              <div className="relative hidden lg:block h-full w-full">
                {illustration}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
