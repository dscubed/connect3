"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Upload,
  X,
  FileText,
  ArrowLeft,
  Trash2,
  User,
  Plus,
} from "lucide-react";
import Link from "next/link";

// Animated particles component (same as home page)
const AnimatedParticles = () => {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      duration: number;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white/20 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function OnboardingPage() {
  const [description, setDescription] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null
  );
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

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

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPortfolioFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removePortfolioFile = (index: number) => {
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please tell us about yourself.");
      return;
    }
    if (!profilePic) {
      setError("Please upload a profile picture.");
      return;
    }
    setError("");
    // TODO: Handle actual submission
    alert("Welcome to connect³! (Profile created successfully)");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative">
      {/* Animated particles background */}
      <AnimatedParticles />

      {/* Gradient accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, #7C3AED55 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-16 h-56 w-56 rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, #06B6D455 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen p-4">
        {/* Header */}
        <div className="max-w-6xl mx-auto pt-8 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to connect³</span>
          </Link>

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
        </div>

        <div className="max-w-6xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left side - Large description textarea */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full shadow-2xl">
                <label className="block text-white/80 text-sm mb-4 font-medium">
                  Describe yourself, your work, and what you&nbsp;re looking for
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your background, current projects, skills, interests, and what kind of collaborators you're seeking. The more detail you provide, the better we can match you with the right people..."
                  className="w-full h-96 px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Right side - Profile pic and file uploads */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <label className="block text-white/80 text-sm mb-4 font-medium">
                  Profile Picture *
                </label>

                <div className="flex justify-center">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {profilePicPreview ? (
                      <div className="relative">
                        <img
                          src={profilePicPreview || "/placeholder.svg"}
                          alt="Profile preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-xl group-hover:border-white/40 transition-all"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfilePic(null);
                            setProfilePicPreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all hover:scale-110 shadow-lg z-20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-white/5 border-4 border-white/20 flex items-center justify-center group-hover:border-white/40 group-hover:from-white/15 group-hover:to-white/10 transition-all shadow-xl cursor-pointer">
                        <div className="text-center">
                          <User className="h-8 w-8 text-white/40 mx-auto mb-1 group-hover:text-white/60 transition-colors" />
                          <p className="text-white/40 text-xs group-hover:text-white/60 transition-colors">
                            Click to upload
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <label className="block text-white/80 text-sm mb-4 font-medium">
                  Portfolio Files (Optional)
                </label>

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
              </div>

              {/* Submit button */}
              <div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center shadow-lg"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-white to-white/90 text-black font-semibold hover:from-white/95 hover:to-white/85 transition-all shadow-xl"
                >
                  Join connect³
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
