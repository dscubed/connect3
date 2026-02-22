"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
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
        redirectTo: `${getSiteUrl()}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-400";

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {success ? (
        <>
          <h1 className="text-2xl font-medium tracking-tight text-black">
            Check your email
          </h1>

          <p className="text-base text-black/50">
            If you registered using email and password, you’ll receive a reset
            link shortly.
          </p>

          <Button
            onClick={() => router.push("/auth/login")}
            className={cn(
              "mt-2 w-full rounded-md text-sm font-semibold text-white",
              "bg-foreground hover:bg-foreground/80 transition-colors",
            )}
          >
            Back to login
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-medium tracking-tight text-black">
            Reset password
          </h1>

          <p className="text-base text-black/50">
              Enter your email and we’ll send you a link to reset your password.
            </p>

          <form onSubmit={handleForgotPassword} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-black">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "mt-2 w-full rounded-md text-sm font-semibold text-white",
                "bg-foreground hover:bg-foreground/80 transition-colors",
              )}
            >
              {isLoading ? "Sending..." : "Send reset email"}
            </Button>

          </form>

          <p className="text-center text-base text-black/50">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-foreground hover:underline"
            >
              Log in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
