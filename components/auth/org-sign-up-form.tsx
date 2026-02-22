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

  const inputClass =
    "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-violet-400";

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="space-y-1">
        <h1 className="text-2xl font-medium tracking-tight text-black">
          Create an organisation (dev)
        </h1>
        <p className="text-base text-black/50">
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
          />
        </div>

        <Button
          type="submit"
          className={cn(
            "mt-5 w-full rounded-md text-sm font-semibold text-white",
            "bg-foreground hover:bg-foreground/80 transition-colors",
          )}
          disabled={isSigningUp}
        >
          {isSigningUp ? "Creating organisation..." : "Create organisation"}
        </Button>
      </form>

      <p className="text-center text-base text-black/50">
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
