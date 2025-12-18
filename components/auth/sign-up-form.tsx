// components/auth/sign-up-form.tsx
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
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
  const [accountType, setAccountType] = useState<"user" | "organisation">(
    "user"
  );

  const { isSigningUp, handleEmailSignUp, handleGoogleSignUp } = useSignUp();

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

  const purple = "bg-foreground hover:bg-foreground/70";

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="border-0 shadow-none p-0 bg-transparent">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-3xl font-semibold tracking-tight text-black">
            Create an account
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-foreground hover:underline"
            >
              Log in
            </Link>
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pt-0">
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-5">
              {/* user / organisation toggle */}
              <div className="inline-flex items-center rounded-full bg-muted/10 p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setAccountType("user")}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2 transition",
                    accountType === "user"
                      ? "bg-white text-black shadow-sm"
                      : "text-muted/70"
                  )}
                >
                  User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountType("organisation");
                    setLastName("");
                  }}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2 transition",
                    accountType === "organisation"
                      ? "bg-white text-black shadow-sm"
                      : "text-muted/70"
                  )}
                >
                  Organisation
                </button>
              </div>

              {/* name row */}
              <div
                className={`grid gap-3 sm:grid-cols-2 ${
                  accountType === "user" ? "" : "sm:grid-cols-1"
                }`}
              >
                <div className="grid gap-1">
                  <Label
                    htmlFor="first-name"
                    className="text-sm font-medium text-black"
                  >
                    {accountType === "user"
                      ? "First name"
                      : "Organisation name"}
                  </Label>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder={
                      accountType === "user"
                        ? "First name"
                        : "Organisation name"
                    }
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 rounded-full border-2 border-muted/20 px-4 text-sm text-black placeholder:text-muted focus-visible:ring-foreground"
                  />
                </div>

                {accountType === "user" && (
                  <div className="grid gap-1">
                    <Label
                      htmlFor="last-name"
                      className="text-sm font-medium text-black"
                    >
                      Last name
                    </Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Last name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 rounded-full border-2 border-muted/20 px-4 text-sm text-black placeholder:text-muted focus-visible:ring-foreground"
                    />
                  </div>
                )}
              </div>

              {/* email */}
              <div className="grid gap-1">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-black"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-full border-2 border-muted/20 px-4 text-sm text-black placeholder:text-muted focus-visible:ring-foreground"
                />
              </div>

              {/* password */}
              <div className="grid gap-1">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-black"
                >
                  Enter your password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-full border-2 border-muted/20 px-4 text-sm text-black placeholder:text-muted focus-visible:ring-foreground"
                />
              </div>

              {/* repeat password */}
              <div className="grid gap-1">
                <Label
                  htmlFor="repeat-password"
                  className="text-sm font-medium text-black"
                >
                  Repeat password
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="h-12 rounded-full border-2 border-muted/20 px-4 text-sm text-black placeholder:text-muted focus-visible:ring-foreground"
                />
              </div>

              {/* main CTA */}
              <Button
                type="submit"
                className={cn(
                  "mt-1 h-12 w-full rounded-full text-sm font-semibold text-white",
                  purple
                )}
                disabled={isSigningUp}
              >
                {isSigningUp ? "Creating account..." : "Create account"}
              </Button>

              {/* divider */}
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="h-px flex-1 bg-muted/20" />
                <span>Or register with</span>
                <span className="h-px flex-1 bg-muted/20" />
              </div>

              {/* Google (always visible) */}
              <Button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isSigningUp}
                aria-label="Sign up with Google"
                className="h-12 w-full rounded-full border border-muted/20 bg-white text-sm font-medium text-muted hover:bg-muted/10 flex items-center justify-center gap-2"
              >
                <FcGoogle size={20} />
                <span>Sign up with Google</span>
                {isSigningUp && (
                  <span className="ml-1 text-xs text-muted">
                    Redirecting...
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
