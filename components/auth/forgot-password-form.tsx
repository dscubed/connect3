"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {success ? (
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-black">
            Check your email
          </h1>
          <p className="text-sm text-black/70">
            If you registered using email and password, you’ll receive a reset
            link shortly.
          </p>

          <div className="pt-6 text-sm">
            <Link href="/auth/login" className="text-[#7c4dff] hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-black">
              Reset password
            </h1>
            <p className="text-sm text-black/70">
              Enter your email and we’ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "h-12 rounded-full border-2 border-black/10 bg-white px-5",
                  "text-black placeholder:text-black/40",
                  "focus-visible:ring-0 focus-visible:border-[#7c4dff]"
                )}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "h-12 w-full rounded-full text-white font-semibold",
                "bg-[#7c4dff] hover:bg-[#6b3dff]",
                "disabled:opacity-60"
              )}
            >
              {isLoading ? "Sending..." : "Send reset email"}
            </Button>

            {/* Divider like your other pages */}
            <div className="relative my-2 flex items-center">
              <span className="w-full border-t border-black/10" />
            </div>

            <div className="text-center text-sm text-black/70">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-[#7c4dff] hover:underline">
                Login
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
