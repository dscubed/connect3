"use client";
import React, { useState, useEffect } from "react";
import { Box, Upload, FileText, Trash2, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import Image from "next/image";
import NameModal from "@/components/auth/NameModal"; // Make sure to create this component
import { toast } from "sonner";
import AnimatedParticles from "@/components/AnimatedParticles";

export default function OnboardingPage() {
  const [description, setDescription] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  // Removed error state, using toast for errors

  // Get user from auth store
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const { updateProfile } = useAuthStore.getState();

  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    if (
      user?.app_metadata?.provider === "google" &&
      profile &&
      profile.name_provided === false
    ) {
      setShowNameModal(true);
    }
  }, [user, profile]);

  useEffect(() => {
    if (profile?.avatar_url) {
      setProfilePicPreview(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicClick = () => {
    if (profilePicPreview) {
      setProfilePic(null);
      setProfilePicPreview(null);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allowedExtensions = ["pdf", "doc", "docx"];
      const newFiles: File[] = [];
      const invalidFiles: string[] = [];
      const maxFiles = 2;
      const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
      const currentCount = portfolioFiles.length;
      Array.from(e.target.files).forEach((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!ext || !allowedExtensions.includes(ext)) {
          invalidFiles.push(file.name);
          return;
        }
        if (file.size > maxFileSize) {
          toast.error(`${file.name} is too large. Max size is 5MB per file.`);
          return;
        }
        if (newFiles.length + currentCount < maxFiles) {
          newFiles.push(file);
        }
      });
      if (invalidFiles.length > 0) {
        toast.error(
          `Invalid file type: ${invalidFiles.join(
            ", "
          )}. Only PDF, DOC, and DOCX files are allowed.`
        );
      }
      if (
        newFiles.length + currentCount > maxFiles ||
        currentCount >= maxFiles
      ) {
        toast.error(`You can upload a maximum of ${maxFiles} files.`);
      }
      if (newFiles.length > 0 && newFiles.length + currentCount <= maxFiles) {
        setPortfolioFiles((prev) => [...prev, ...newFiles]);
      }
    }
  };

  const removePortfolioFile = (index: number) => {
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please tell us about yourself.");
      return;
    }
    if (!profilePic) {
      toast.error("Please upload a profile picture.");
      return;
    }
    // TODO: Handle actual submission
    alert("Welcome to connect³! (Profile created successfully)");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#0B0B0C] text-white relative"
    >
      {/* Animated particles background */}
      <AnimatedParticles />

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 min-h-screen p-4"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="max-w-6xl mx-auto pt-8 mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-xl bg-white/10 grid place-items-center border border-white/10">
              <Box className="h-5 w-5" />
            </div>
            <span className="font-semibold text-xl tracking-tight">
              connect<sup className="pl-0.5">3</sup>
            </span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Tell us about yourself
            </h1>
            <p className="text-white/60">
              Our NLP will help match you with the right collaborators
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="max-w-6xl mx-auto"
        >
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left side - Large description textarea */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              className="lg:col-span-2"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full shadow-2xl"
              >
                <label className="block text-white/80 text-sm mb-4 font-medium">
                  Describe yourself, your work, and what you&nbsp;re looking for
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your background, current projects, skills, interests, and what kind of collaborators you're seeking. The more detail you provide, the better we can match you with the right people..."
                  className="w-full h-96 px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all resize-none shadow-inner"
                />
              </motion.div>
            </motion.div>

            {/* Right side - Profile pic and file uploads */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
              >
                <label className="block text-white/80 text-sm mb-4 font-medium">
                  Profile Picture *
                </label>

                <div className="flex justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleProfilePicChange}
                  />
                  <div
                    className="relative group"
                    onClick={handleProfilePicClick}
                    style={{ cursor: "pointer" }}
                  >
                    {profilePicPreview ? (
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 group-hover:border-white/40 shadow-xl">
                        <Image
                          src={profilePicPreview}
                          alt="Profile preview"
                          fill
                          className="object-cover rounded-full"
                          sizes="128px"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Trash2 className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white/20 group-hover:border-white/40 transition-all shadow-xl">
                        <span className="text-white font-semibold text-3xl">
                          {profile?.first_name?.[0] || "U"}
                        </span>
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
              >
                <label className="block text-white/80 text-sm mb-4 font-medium">
                  Portfolio Files (Optional)
                </label>
                <div className="mb-2 text-right text-xs text-white/50">
                  {portfolioFiles.length} / 2 files uploaded
                </div>
                {/* File list */}
                <div className="space-y-3 mb-4">
                  {portfolioFiles.length > 0 ? (
                    portfolioFiles.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all group shadow-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                            <FileText className="h-4 w-4 text-white/60" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white/80 text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-white/40 text-xs">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePortfolioFile(index)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-white/40">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No files uploaded yet</p>
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf, .doc, .docx"
                    multiple
                    onChange={handlePortfolioChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30 hover:text-white transition-all shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">Upload Files</span>
                  </button>
                </div>
              </motion.div>

              {/* Submit button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
              >
                {/* Error display removed, now using toast for errors */}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-white to-white/90 text-black font-semibold hover:from-white/95 hover:to-white/85 transition-all shadow-xl"
                >
                  Join connect³
                </motion.button>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>
        {showNameModal && (
          <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-auto">
            <NameModal
              open={showNameModal}
              firstName={profile?.first_name ?? ""}
              lastName={profile?.last_name ?? ""}
              onClose={() => setShowNameModal(false)}
              onSubmit={async (firstName, lastName) => {
                await updateProfile({
                  first_name: firstName,
                  last_name: lastName,
                  name_provided: true,
                });
                setShowNameModal(false);
                toast.success(
                  `Welcome, ${firstName} ${lastName}! Your name was successfully updated.`
                );
              }}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
