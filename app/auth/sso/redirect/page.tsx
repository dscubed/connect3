import { Suspense } from "react";
import { SSORedirectClient } from "./SSORedirectClient";

export default function SSORedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
          <p className="text-sm text-muted-foreground">Signing you in...</p>
        </div>
      }
    >
      <SSORedirectClient />
    </Suspense>
  );
}
