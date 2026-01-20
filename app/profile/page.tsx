"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { ProfilePageContent } from "./ProfilePageContent";
import SetupEventsModal from "@/components/profile/SetupEventsModal";
import Sidebar from "@/components/sidebar/Sidebar";
import { toast } from "sonner";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const { user, profile, updateProfile, loading, makeAuthenticatedRequest } =
    useAuthStore();
  const [showEventOnboardingModal, setShowEventOnboardingModal] =
    useState(false);

  useEffect(() => {
    if (loading) return;
    if (!profile) return;

    if (!profile.humanitix_event_integration_setup) {
      setShowEventOnboardingModal(true);
    }
  }, [loading, profile]);

  const onEventModalClose = () => {
    setShowEventOnboardingModal(false);
  };

  const onEventModalSubmit = async (apiKey: string) => {
    if (!profile) return;

    try {
      const response = await makeAuthenticatedRequest(
        "/api/onboarding/humanitix/createSecret",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: profile.id,
            value: apiKey,
          }),
        },
      );

      if (response.ok) {
        const responseData = await response.json();
        let message = "API key added successfully";
        if (responseData.success) {
          // On success set the humanitix flag to true so we don't get the modal again
          await updateProfile({
            ...profile,
            humanitix_event_integration_setup: true,
          });
        } else {
          message = "Failed to add API key: " + responseData.error;
        }
        toast(message);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        toast("Failed to add API key: " + errorData.error || "Request failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast("Error adding API key: " + error.message);
      } else {
        toast("Error adding API key: Unknown error occurred");
      }
    }

    setShowEventOnboardingModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <CubeLoader size={32} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 pt-16 md:pt-0 relative">
          <SetupEventsModal
            isOpen={showEventOnboardingModal}
            onClose={onEventModalClose}
            onSubmit={onEventModalSubmit}
          />
          <ProfilePageContent
            editingProfile={editingProfile}
            setEditingProfile={setEditingProfile}
            profile={profile}
          />
        </main>
      </div>
    </div>
  );
}
