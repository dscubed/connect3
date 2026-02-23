"use client";

import { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedVisitorId: string | null = null;

export function useFingerprint() {
  const [visitorId, setVisitorId] = useState<string | null>(cachedVisitorId);

  useEffect(() => {
    if (cachedVisitorId) return;

    const load = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      cachedVisitorId = result.visitorId;
      setVisitorId(result.visitorId);
    };

    load().catch(console.error);
  }, []);

  return visitorId;
}

/**
 * Get the cached fingerprint synchronously (for use outside React).
 * Returns null if FingerprintJS hasn't loaded yet.
 */
export function getFingerprint(): string | null {
  return cachedVisitorId;
}
