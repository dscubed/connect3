"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useLogin } from "@/components/auth/hooks/useLogin";
import { useState } from "react";

export function LoginForm({
  className,
  onLoggingInChange,
  isLoading = false,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  onLoggingInChange?: (loggingIn: boolean) => void;
  isLoading?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoggingIn, handleEmailLogin } = useLogin(onLoggingInChange);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleEmailLogin({ email, password });
  };

  const busy = isLoading || isLoggingIn;

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Welcome back
        </h1>
        <p className="text-sm text-black/50">
          Log in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
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
            className="h-12 rounded-xl border-2 border-black/10 bg-black/[0.02] px-4 text-sm text-black placeholder:text-black/30 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-black">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-black/40 hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl border-2 border-black/10 bg-black/[0.02] px-4 text-sm text-black placeholder:text-black/30 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
          />
        </div>

        <Button
          type="submit"
          className={cn(
            "mt-2 h-12 w-full rounded-xl text-sm font-semibold text-white",
            "bg-foreground hover:bg-foreground/80 transition-colors",
          )}
          disabled={busy}
        >
          {busy ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="text-center text-sm text-black/50">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/sign-up"
          className="font-semibold text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>

      {process.env.NODE_ENV !== "production" && (
        <p className="text-center text-sm text-black/50">
          <Link
            href="/auth/org/sign-up"
            className="font-semibold text-foreground hover:underline"
          >
            Organisation sign up
          </Link>
          <span className="ml-1.5 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-300">
            DEV
          </span>
        </p>
      )}
    </div>
  );
}
