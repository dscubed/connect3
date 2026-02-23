"use client";

import React from "react";
import { useAuthStore } from "@/stores/authStore";
import { LoggedInAuthButton } from "./LoggedInAuthButton";
import { LoggedOutAuthButton } from "./LoggedOutAuthButton";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarAuthButton() {
  const { user, profile, loading, profileLoading } = useAuthStore();

  // Auth session loading or profile fetch in-flight
  if (loading || profileLoading) {
    return <Skeleton className="w-8 h-8 rounded-full" />;
  }

  return user && profile ? <LoggedInAuthButton /> : <LoggedOutAuthButton />;
}
