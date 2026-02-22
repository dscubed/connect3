"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useSignUp } from "./hooks/useSignup";
import { validatePassword } from "@/lib/auth/validatePassword";

export function OrgSignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const accountType = "organisation" as const;

  const { isSigningUp, handleEmailSignUp } = useSignUp();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setFormError(passwordValidation.error ?? "Invalid password");
      return;
    }

    const result = await handleEmailSignUp({
      email,
      password,
      repeatPassword,
      firstName: orgName,
      lastName: "",
      accountType,
    });
    if (result?.error) setFormError(result.error);
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
        {formError && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </div>
        )}
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
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
            <p className="font-medium text-neutral-800">Password Requirements</p>
            <p className="mt-0.5">Lowercase, uppercase letters, digits and symbols</p>
            <p className="mt-0.5 text-neutral-500">Minimum length: 6 characters</p>
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
