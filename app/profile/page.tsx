"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ProfilePageContent } from "./ProfilePageContent";
import { ProfilePageSkeleton } from "@/components/profile/ProfilePageSkeleton";
// import SetupEventsModal from "@/components/profile/SetupEventsModal";
import Sidebar from "@/components/sidebar/Sidebar";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const { user, profile, loading } = useAuthStore();
  // const [showEventOnboardingModal, setShowEventOnboardingModal] =
  //   useState(false);

  useEffect(() => {
    if (loading) return;
    if (!profile) return;

    // if (!profile.humanitix_event_integration_setup) {
    //   setShowEventOnboardingModal(true);
    // }
  }, [loading, profile]);

  // const onEventModalClose = () => {
  //   setShowEventOnboardingModal(false);
  // };

  // const onEventModalSubmit = async (apiKey: string) => {
  //   if (!profile) return;

  //   try {
  //     const response = await makeAuthenticatedRequest(
  //       "/api/onboarding/humanitix/createSecret",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           key: profile.id,
  //           value: apiKey,
  //         }),
  //       },
  //     );

  //     if (response.ok) {
  //       const responseData = await response.json();
  //       let message = "API key added successfully";
  //       if (responseData.success) {
  //         // On success set the humanitix flag to true so we don't get the modal again
  //         await updateProfile({
  //           ...profile,
  //           humanitix_event_integration_setup: true,
  //         });
  //       } else {
  //         message = "Failed to add API key: " + responseData.error;
  //       }
  //       toast(message);
  //     } else {
  //       const errorData = await response
  //         .json()
  //         .catch(() => ({ error: "Unknown error occurred" }));
  //       toast("Failed to add API key: " + errorData.error || "Request failed");
  //     }
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       toast("Error adding API key: " + error.message);
  //     } else {
  //       toast("Error adding API key: Unknown error occurred");
  //     }
  //   }

  //   setShowEventOnboardingModal(false);
  // };

  if (loading) {
    return (
      <div className="min-h-[100dvh] relative overflow-hidden">
        <div className="flex flex-col md:flex-row relative z-10 h-[100dvh]">
          <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
          <main
            className="flex-1 min-h-0 relative overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            <ProfilePageSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <div className="flex flex-col md:flex-row relative z-10 h-[100dvh]">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main
          className="flex-1 min-h-0 relative overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
          }}
        >
          {/* Disable for now */}
          {/* <SetupEventsModal
            isOpen={showEventOnboardingModal}
            onClose={onEventModalClose}
            onSubmit={onEventModalSubmit}
          /> */}
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
