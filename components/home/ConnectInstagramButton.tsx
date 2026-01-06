"use client";

import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

export function ConnectInstagramButton() {
  const [loading, setLoading] = useState(false);
  const { profile, updateProfile } = useAuthStore();
  
  const isConnected = profile?.instagram_connected;

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

  const handleDisconnect = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/instagram/disconnect", { method: "POST" });
      
      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      // Update local state to reflect disconnection immediately
      await updateProfile({ instagram_connected: false });
      toast.success("Disconnected from Instagram");
      
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to disconnect Instagram account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={loading}
      className={`gap-2 text-white mr-4 ${isConnected ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20" : "bg-white/10 border-white/20 hover:bg-white/20"}`}
    >
      <Instagram className="w-4 h-4" />
      {loading 
        ? (isConnected ? "Disconnecting..." : "Connecting...") 
        : (isConnected ? "Disconnect Instagram Account" : "Connect Instagram Account")
      }
    </Button>
  );
}
