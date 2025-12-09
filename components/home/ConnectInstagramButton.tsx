"use client";

import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function ConnectInstagramButton() {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // Check if FB SDK is already initialized
    const checkFB = () => {
      if (typeof window !== 'undefined' && (window as any).FB) {
        setSdkReady(true);
        return true;
      }
      return false;
    };

    if (checkFB()) return;

    // Poll for FB SDK initialization
    const interval = setInterval(() => {
      if (checkFB()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleConnect = async () => {
    if (!sdkReady) {
      toast.error("Facebook SDK not loaded yet. Please try again in a moment.");
      return;
    }

    setLoading(true);

    (window as any).FB.login(
      function (response: any) {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          
          // Exchange token on backend (handle async inside sync callback)
          fetch("/api/auth/instagram/exchange-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ accessToken }),
          })
            .then((res) => res.json().then((data) => ({ res, data })))
            .then(({ res, data }) => {
              if (!res.ok) {
                throw new Error(data.error || "Failed to link account");
              }
              toast.success("Instagram account connected successfully!");
              window.location.reload();
            })
            .catch((error: any) => {
              console.error(error);
              toast.error(error.message || "Failed to connect Instagram");
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          console.log("User cancelled login or did not fully authorize.");
          setLoading(false);
        }
      },
      {
        scope:
          "instagram_basic,pages_show_list,pages_read_engagement,business_management",
      }
    );
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
      Connect Instagram Account
    </Button>
  );
}
