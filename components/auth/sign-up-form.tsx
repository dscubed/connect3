"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export function SignUpForm({
  className,
  onSigningUpChange,
  isSigningUp = false,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  onSigningUpChange?: (signingUp: boolean) => void;
  isSigningUp?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Remove local isLoading
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setError(null);
    if (onSigningUpChange) onSigningUpChange(true);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      if (onSigningUpChange) onSigningUpChange(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) {
        throw error;
      }
      if (
        data?.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        setError("Account already exists.");
        if (onSigningUpChange) onSigningUpChange(false);
        return;
      }
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      if (onSigningUpChange) onSigningUpChange(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    setError(null);
    if (onSigningUpChange) onSigningUpChange(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      if (onSigningUpChange) onSigningUpChange(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="flex gap-2">
                <div className="flex-1 grid gap-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="First Name"
                    required
                    value={firstName}
                    onChange={(e) => setfirstName(e.target.value)}
                  />
                </div>
                <div className="flex-1 grid gap-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    type="text"
                    placeholder="Last Name"
                    required
                    value={lastName}
                    onChange={(e) => setlastName(e.target.value)}
                  />
                </div>
              </div>
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isSigningUp}>
                  {isSigningUp ? "Creating an account..." : "Sign up"}
                </Button>
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
                  {isSigningUp && <span className="ml-2">Redirecting...</span>}
                </Button>
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
