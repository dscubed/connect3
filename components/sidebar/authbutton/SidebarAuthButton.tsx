"use client";

import React from "react";
import { useAuthStore } from "@/stores/authStore";
import { LoggedInAuthButton } from "./LoggedInAuthButton";
import { LoggedOutAuthButton } from "./LoggedOutAuthButton";

export function SidebarAuthButton() {
  const { user, loading, profile } = useAuthStore.getState();

  if (loading) {
    return <div className="w-10 h-10 rounded-full bg-black/10 animate-pulse" />;
  }

  return user && profile ? <LoggedInAuthButton /> : <LoggedOutAuthButton />;
}
