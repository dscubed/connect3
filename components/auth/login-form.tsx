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
  const { isLoggingIn, handleEmailLogin, handleGoogleLogin } =
    useLogin(onLoggingInChange);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleEmailLogin({ email, password });
  };

  const busy = isLoading || isLoggingIn;
  const purple = "bg-[#8F5BFF] hover:bg-[#7b4ae6]";

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="border-0 shadow-none p-0 bg-transparent">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-3xl font-semibold tracking-tight text-black">
            Log in
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-gray-700">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="font-semibold text-[#8F5BFF] hover:underline"
            >
              Sign up
            </Link>
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pt-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
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
                  className="h-12 rounded-full border-2 border-gray-200 px-4 text-sm text-black placeholder:text-gray-400 focus-visible:ring-[#8F5BFF]"
                />
              </div>

              {/* password */}
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-black"
                  >
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-[#8F5BFF] hover:underline"
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
                  className="h-12 rounded-full border-2 border-gray-200 px-4 text-sm text-black placeholder:text-gray-400 focus-visible:ring-[#8F5BFF]"
                />
              </div>

              {/* main CTA */}
              <Button
                type="submit"
                className={cn(
                  "mt-1 h-12 w-full rounded-full text-sm font-semibold text-white",
                  purple
                )}
                disabled={busy}
              >
                {busy ? "Logging in..." : "Login"}
              </Button>

              {/* divider */}
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="h-px flex-1 bg-gray-200" />
                <span>Or login with</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Google */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={busy}
                aria-label="Login with Google"
                className="h-12 w-full rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <FcGoogle size={20} />
                <span>Login with Google</span>
                {busy && (
                  <span className="ml-1 text-xs text-gray-500">
                    Redirecting...
                  </span>
                )}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
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
