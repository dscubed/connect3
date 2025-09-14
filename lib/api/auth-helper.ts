import { createClient, Session } from "@supabase/supabase-js";
import { useAuthStore } from "@/stores/authStore";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

export class AuthHelper {
  private static session: Session | null = null;
  private static refreshPromise: Promise<Session> | null = null;

  static async getAuthHeaders(): Promise<{ [key: string]: string }> {
    try {
      // Use cached session if valid
      if (this.session?.access_token) {
        const now = Date.now() / 1000;
        // Add 30 second buffer before expiry
        if (this.session.expires_at && this.session.expires_at > now + 30) {
          return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.session.access_token}`,
          };
        }
      }

      // Get fresh session (with deduplication)
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshSession();
      }

      const session = await this.refreshPromise;
      this.refreshPromise = null;

      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };
    } catch (error) {
      console.error("❌ Auth error:", error);
      // this.clearSession();
      throw new Error("Authentication required. Please log in.");
    }
  }

  private static async refreshSession(): Promise<Session> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Session error:", error);
        throw new Error("Failed to get authentication session");
      }

      if (!session?.access_token) {
        // Don't automatically sign out - just throw error
        throw new Error("No valid authentication session");
      }

      // Update auth store if user changed
      const authState = useAuthStore.getState();
      if (!authState.user || authState.user.id !== session.user.id) {
        console.log("🔄 User session mismatch, may need to refresh auth store");
        // Optionally trigger a profile refresh here
      }

      // Cache the session
      this.session = session;
      return session;
    } catch (error) {
      // Only sign out on actual auth errors, not missing sessions
      if (error instanceof Error && error.message.includes("Failed to get")) {
        useAuthStore.getState().signOut();
      }
      throw error;
    }
  }

  static async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    console.log("🔐 Making authenticated request to", url);
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Handle auth errors globally
      if (response.status === 401) {
        this.clearSession();
        throw new Error("Authentication failed. Please log in again.");
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Authentication")) {
        throw error;
      }

      console.error("❌ Request error:", error);
      throw new Error("Network request failed. Please try again.");
    }
  }

  static getCurrentUser() {
    return useAuthStore.getState().user;
  }

  static isAuthenticated(): boolean {
    const authState = useAuthStore.getState();
    return !!authState.user;
  }

  static clearSession(): void {
    this.session = null;
    this.refreshPromise = null;
    useAuthStore.getState().signOut();
  }

  // Optional: Set up auth state listener
  static setupAuthListener() {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Auth state changed:", event);

      if (event === "SIGNED_OUT") {
        this.clearSession();
      } else if (event === "TOKEN_REFRESHED" && session) {
        this.session = session;
      }
    });
  }
}
