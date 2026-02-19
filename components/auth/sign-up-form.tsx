"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useSignUp } from "./hooks/useSignup";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const accountType = "user" as const;

  const { isSigningUp, handleEmailSignUp } = useSignUp();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEmailSignUp({
      email,
      password,
      repeatPassword,
      firstName,
      lastName,
      accountType,
    });
  };

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Create an account
        </h1>
        <p className="text-sm text-black/50">
          Sign up to get started with Connect3
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first-name" className="text-sm font-medium text-black">
              First name
            </Label>
            <Input
              id="first-name"
              type="text"
              placeholder="First name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 rounded-xl border-2 border-black/10 bg-black/[0.02] px-4 text-sm text-black placeholder:text-black/30 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last-name" className="text-sm font-medium text-black">
              Last name
            </Label>
            <Input
              id="last-name"
              type="text"
              placeholder="Last name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12 rounded-xl border-2 border-black/10 bg-black/[0.02] px-4 text-sm text-black placeholder:text-black/30 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
            />
          </div>
        </div>

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
          <Label htmlFor="password" className="text-sm font-medium text-black">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl border-2 border-black/10 bg-black/[0.02] px-4 text-sm text-black placeholder:text-black/30 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repeat-password" className="text-sm font-medium text-black">
            Repeat password
          </Label>
          <Input
            id="repeat-password"
            type="password"
            required
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className="h-12 rounded-xl border-2 border-black/10 bg-black/[0.02] px-4 text-sm text-black placeholder:text-black/30 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
          />
        </div>

        <Button
          type="submit"
          className={cn(
            "mt-2 h-12 w-full rounded-xl text-sm font-semibold text-white",
            "bg-foreground hover:bg-foreground/80 transition-colors",
          )}
          disabled={isSigningUp}
        >
          {isSigningUp ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-black/50">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-foreground hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
