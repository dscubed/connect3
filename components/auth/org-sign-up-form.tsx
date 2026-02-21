"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useSignUp } from "./hooks/useSignup";

export function OrgSignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const accountType = "organisation" as const;

  const { isSigningUp, handleEmailSignUp } = useSignUp();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEmailSignUp({
      email,
      password,
      repeatPassword,
      firstName: orgName,
      lastName: "",
      accountType,
    });
  };

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="space-y-2">
        <div className="mb-3 inline-block rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-300">
          DEV &mdash; Organisation Account
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Create an organisation
        </h1>
        <p className="text-sm text-black/50">
          Sign up to register your organisation on Connect3
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="org-name" className="text-sm font-medium text-black">
            Organisation name
          </Label>
          <Input
            id="org-name"
            type="text"
            placeholder="Acme Inc."
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="h-12 rounded-xl border-2 border-black/10 bg-black/[0.02] px-4 text-sm text-black placeholder:text-black/30 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-black">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@organisation.com"
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
          {isSigningUp ? "Creating organisation..." : "Create organisation"}
        </Button>
      </form>

      <p className="text-center text-sm text-black/50">
        Already have an organisation account?{" "}
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
