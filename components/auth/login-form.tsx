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

  const inputClass =
    "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-400";

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="space-y-1">
        <h1 className="text-2xl font-medium tracking-tight text-black">
          Welcome back
        </h1>
        <p className="text-base text-black/50">
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
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-black"
            >
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
            className={inputClass}
          />
        </div>

        <Button
          type="submit"
          className={cn(
            "mt-5 w-full rounded-md text-sm font-semibold text-white",
            "bg-foreground hover:bg-foreground/80 transition-colors",
          )}
          disabled={busy}
        >
          {busy ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="text-center text-base text-black/50">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/sign-up"
          className="font-semibold text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>

      {process.env.NODE_ENV !== "production" && (
        <p className="text-center text-base text-black/50">
          Need an organisation account?{" "}
          <Link
            href="/auth/org/sign-up"
            className="font-semibold text-foreground hover:underline"
          >
            Sign up (dev)
          </Link>
        </p>
      )}
    </div>
  );
}
