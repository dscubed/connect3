"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // user already has a session after opening reset link
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-black">
            Reset password
          </h1>
          <p className="text-sm text-black/70">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-black font-semibold">
              New password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="New password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "h-12 rounded-full border-2 border-black/10 bg-white px-5",
                "text-black placeholder:text-black/40",
                "focus-visible:ring-0 focus-visible:border-[#7c4dff]"
              )}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "h-12 w-full rounded-full text-white font-semibold",
              "bg-[#7c4dff] hover:bg-[#6b3dff]",
              "disabled:opacity-60"
            )}
          >
            {isLoading ? "Saving..." : "Save new password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
