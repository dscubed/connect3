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

// Remove the props interface since useSignUp handles the state
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
    console.log("Submitting sign up form", {
      email,
      firstName,
      lastName,
      accountType,
    });
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-4">
              {/* Tabs for account type */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={accountType === "user" ? "default" : "outline"}
                  onClick={() => setAccountType("user")}
                  className="flex-1"
                >
                  User
                </Button>
                <Button
                  type="button"
                  variant={
                    accountType === "organisation" ? "default" : "outline"
                  }
                  onClick={() => {
                    setAccountType("organisation");
                    setLastName("");
                  }}
                  className="flex-1"
                >
                  Organisation
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 grid gap-2">
                  <Label htmlFor="first-name">
                    {accountType === "user"
                      ? "First Name"
                      : "Organisation Name"}
                  </Label>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder={
                      accountType === "user"
                        ? "First Name"
                        : "Organisation Name"
                    }
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                {accountType === "user" && (
                  <div className="flex-1 grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Last Name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                )}
              </div>
              {/* ...existing code for email, password, etc... */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Repeat Password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isSigningUp}>
                  {isSigningUp ? "Creating an account..." : "Sign up"}
                </Button>
                {accountType === "user" && (
                  <>
                    <div className="relative my-2 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                      <span className="mx-2 text-xs text-gray-500">or</span>
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <Button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                      onClick={handleGoogleSignUp}
                      disabled={isSigningUp}
                      aria-label="Sign up with Google"
                    >
                      <span>Sign up with </span>
                      <FcGoogle size={20} />
                      {isSigningUp && (
                        <span className="ml-2">Redirecting...</span>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
