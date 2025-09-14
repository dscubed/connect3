"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Edit3, MapPin, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import { CubeLoader } from "@/components/ui/CubeLoader";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingName, setEditingName] = useState({
    firstName: "",
    lastName: "",
  });
  const [editingLocation, setEditingLocation] = useState("");
  const [editingStatus, setEditingStatus] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { user, profile, loading, initialize, updateProfile } = useAuthStore();

  useEffect(() => {
    // Make sure auth is initialized
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Initialize editing states when profile loads
    if (profile) {
      setEditingName({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
      });
      setEditingLocation(profile.location || "");
    }
  }, [profile]);

  console.log("Auth state:", { user: !!user, profile, loading });

  const handleNameClick = () => {
    if (profile) {
      setEditingName({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
      });
      setShowNameModal(true);
    }
  };

  const handleLocationClick = () => {
    if (profile) {
      setEditingLocation(profile.location || "");
      setShowLocationModal(true);
    }
  };

  const handleStatusClick = () => {
    if (profile) {
      setEditingStatus(profile.status || "");
      setShowStatusModal(true);
    }
  };

  const handleSaveName = async () => {
    try {
      await updateProfile({
        first_name: editingName.firstName.trim(),
        last_name: editingName.lastName.trim(),
      });
      setShowNameModal(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  const handleSaveLocation = async () => {
    try {
      await updateProfile({
        location: editingLocation.trim(),
      });
      setShowLocationModal(false);
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  const handleSaveStatus = async () => {
    try {
      await updateProfile({
        status: editingStatus.trim(),
      });
      setShowStatusModal(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0C] text-white">
        <div className="flex items-center gap-4">
          <CubeLoader size={32} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0C] text-white">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0C] text-white">
        <p>Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <main className="flex-1 pt-16 md:pt-0 relative">
          <div
            className="h-screen overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            {/* Cover Image - Full Width */}
            <motion.div
              className="relative h-48 md:h-64 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <Image
                src={
                  profile.cover_image_url ||
                  "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/conver_image/sample_cover1.jpg"
                }
                alt="Cover"
                fill
                className="object-cover"
                priority
              />

              {/* Vignette Effect */}
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />

              {/* Additional edge blur effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

              {/* Edit Cover Button */}
              <motion.button
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/30 border border-white/20 hover:bg-black/40 transition-all backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit3 className="h-4 w-4" />
              </motion.button>
            </motion.div>

            {/* Profile Content */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
              {/* Profile Header */}
              <motion.div
                className="relative -mt-20 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  {/* Profile Picture */}
                  <div className="relative">
                    <motion.div
                      className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#0B0B0C] bg-[#0B0B0C]"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {profile.avatar_url && (
                        <Image
                          src={profile.avatar_url}
                          alt={`${profile.first_name} ${
                            profile.last_name || ""
                          }`}
                          fill
                          className="object-cover"
                          priority
                        />
                      )}
                    </motion.div>

                    {/* Edit Avatar Button */}
                    <motion.button
                      className="absolute bottom-2 right-2 p-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </motion.button>
                  </div>

                  {/* Name, Status and Location */}
                  <div className="flex-1 md:pb-4">
                    {/* Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <motion.h1
                        className="text-3xl md:text-4xl font-bold text-white cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNameClick}
                      >
                        {profile.first_name} {profile.last_name || ""}
                      </motion.h1>
                    </div>

                    {/* Status */}
                    <motion.div
                      className="flex items-center gap-2 text-white/80 mb-3 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStatusClick}
                    >
                      <Briefcase className="h-4 w-4" />
                      <span className="text-lg">
                        {profile.status || "Add your current status"}
                      </span>
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-2 text-white/60 mb-4 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLocationClick}
                    >
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location || "Location not set"}</span>
                    </motion.div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 md:pb-4">
                    <motion.button
                      className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Save Profile" : "Edit Profile"}
                    </motion.button>

                    <motion.button
                      className="px-6 py-2 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Share Profile
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* About Section */}
              {profile.tldr && (
                <motion.div
                  className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">tldr</h2>
                    <motion.button
                      className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </motion.button>
                  </div>

                  <p className="text-white/80 leading-relaxed text-lg">
                    {profile.tldr}
                  </p>
                </motion.div>
              )}

              {/* Experience Section */}
              <motion.div
                className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold mb-6">Experience</h2>
                <div className="text-white/60 text-center py-12">
                  <p>Experience section coming soon...</p>
                </div>
              </motion.div>

              {/* Skills Section */}
              <motion.div
                className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <h2 className="text-2xl font-bold mb-6">Skills</h2>
                <div className="text-white/60 text-center py-12">
                  <p>Skills section coming soon...</p>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Name Edit Modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1A1A1B] border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit Name</h3>
                <button
                  onClick={() => setShowNameModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editingName.firstName}
                    onChange={(e) =>
                      setEditingName({
                        ...editingName,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editingName.lastName}
                    onChange={(e) =>
                      setEditingName({
                        ...editingName,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNameModal(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveName}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Edit Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1A1A1B] border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit Location</h3>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editingLocation}
                  onChange={(e) => setEditingLocation(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your location"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLocation}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Edit Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1A1A1B] border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit Status</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Current Status
                </label>
                <input
                  type="text"
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Software Engineer at Google, Freelancer, Seeking opportunities..."
                  maxLength={100}
                />
                <p className="text-white/40 text-xs mt-2">
                  {editingStatus.length}/100 characters
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStatus}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
