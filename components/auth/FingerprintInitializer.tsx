"use client";

import { useFingerprint } from "@/hooks/useFingerprint";

export function FingerprintInitializer() {
  useFingerprint();
  return null;
}
