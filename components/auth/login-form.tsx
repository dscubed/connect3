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
import { FcGoogle } from "react-icons/fc";
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
  const { isLoggingIn, handleEmailLogin, handleGoogleLogin } = useLogin(onLoggingInChange);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleEmailLogin({ email, password });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
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
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isLoggingIn}
              >
                {isLoading || isLoggingIn ? "Logging in..." : "Login"}
              </Button>
              <div className="relative my-2 flex items-center">
                <span className="w-full border-t border-gray-300" />
                <span className="mx-2 text-xs text-gray-500">or</span>
                <span className="w-full border-t border-gray-300" />
              </div>
              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isLoggingIn}
                aria-label="Login with Google"
              >
                <span>Login with</span>
                <FcGoogle size={20} />
                {(isLoading || isLoggingIn) && (
                  <span className="ml-2">Redirecting...</span>
                )}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
