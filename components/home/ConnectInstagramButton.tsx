"use client";

import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ConnectInstagramButton() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/instagram/oauth-url");
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to get OAuth URL");
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to initiate Instagram connection. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConnect}
      disabled={loading}
      className="gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white mr-4"
    >
      <Instagram className="w-4 h-4" />
      {loading ? "Connecting..." : "Connect Instagram Account"}
    </Button>
  );
}
