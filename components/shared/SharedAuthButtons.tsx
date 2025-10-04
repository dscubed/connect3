"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SharedAuthButtonsProps {
  className?: string;
  showContact?: boolean;
}

export function SharedAuthButtons({ 
  className, 
  showContact = false 
}: SharedAuthButtonsProps) {
  return (
    <div className={cn("flex gap-2 items-center", className)}>
      {showContact && (
        <Link href="mailto:president@dscubed.org.au?subject=Student Club Join Request | Connect3&body=Hi there!%0D%0A%0D%0A Our club: {club name} is interested in joining Connect3.%0D%0A%0D%0A Here is our club email address: {club email address}.">
          <button className="px-3 py-1.5 text-white/80 hover:text-white text-xs font-medium transition-all whitespace-nowrap">
            Contact
          </button>
        </Link>
      )}
      <Link href="/auth/login">
        <button className="px-3 md:px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all text-xs whitespace-nowrap border border-white/10 hover:scale-105">
          Log in
        </button>
      </Link>
      <Link href="/auth/sign-up">
        <button className="px-3 md:px-4 py-1.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all text-xs whitespace-nowrap shadow-lg hover:scale-105">
          Sign up
        </button>
      </Link>
    </div>
  );
}
