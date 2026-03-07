"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function SSORedirectClient() {
  const searchParams = useSearchParams();
  const target = searchParams.get("target");

  useEffect(() => {
    if (target) {
      window.location.href = target;
    }
  }, [target]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  );
}
