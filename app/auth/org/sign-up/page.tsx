"use client";

import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { OrgSignUpForm } from "@/components/auth/org-sign-up-form";
import AuthLoadingSpinner from "@/components/ui/AuthLoadingSpinner";
import { useAuthStore } from "@/stores/authStore";

export default function Page() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const loading = useAuthStore((state) => state.loading);

  return (
    <AuthShell>{loading ? <AuthLoadingSpinner fullPage={false} /> : <OrgSignUpForm />}</AuthShell>
  );
}
