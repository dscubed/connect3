"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  User,
  ArrowRight,
  ChevronsRightIcon as Skip,
  Check,
  Box,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import NameModal from "@/components/auth/NameModal";
import { toast } from "sonner";
import AnimatedParticles from "@/components/AnimatedParticles";
import FileUploadCube from "@/components/onboarding/cube/FileUploadCube";

const InteractiveTextArea = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);
    setWordCount(
      text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    );
  };

  return (
    <motion.div
      className="relative max-w-2xl mx-auto"
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`relative rounded-3xl border-2 transition-all duration-300 ${
          isFocused
            ? "border-white/40 bg-white/8"
            : "border-white/20 bg-white/5"
        } backdrop-blur-md overflow-hidden`}
      >
        <motion.div
          className="absolute inset-0 rounded-3xl"
          animate={{
            boxShadow: isFocused
              ? "0 0 40px 2px rgba(255,255,255,0.1) inset"
              : "0 0 20px 1px rgba(255,255,255,0.05) inset",
          }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: isFocused ? 360 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <FileText className="h-6 w-6 text-white/60" />
            </motion.div>
            <h3 className="text-white font-semibold">Tell us about yourself</h3>
          </div>

          <textarea
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Write naturally about your experiences, projects, or what you're passionate about... No pressure to be formal - just be yourself! ✨"
            className="w-full h-40 bg-transparent text-white placeholder:text-white/40 resize-none outline-none leading-relaxed"
            style={{ fontSize: "16px" }}
          />

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-sm">
              Write as much or as little as you&nbsp;d like
            </p>
            <motion.div
              animate={{ opacity: wordCount > 0 ? 1 : 0.5 }}
              className="text-white/60 text-sm"
            >
              {wordCount} words
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-4 pointer-events-none"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${5 + i * 10}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.2,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ProfilePicUpload = ({
  onImageUpload,
  imageUrl,
}: {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageUpload(files[0]);
    }
  };

  return (
    <motion.div
      className="relative mx-auto w-48 h-48"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative w-full h-full cursor-pointer"
        animate={{ scale: isHovered ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20 bg-white/5 backdrop-blur-md">
          {imageUrl ? (
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <User className="h-16 w-16 text-white/40" />
              </motion.div>
              <p className="text-white/60 text-sm text-center px-4">
                Add your photo
              </p>
            </div>
          )}
        </div>

        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={{
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered ? 0.8 : 0.3,
          }}
          transition={{ duration: 0.3 }}
        />

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm"
            >
              <Upload className="h-8 w-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </motion.div>
  );
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
      setProfileImage(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  const handleFileUpload = (file: File) => {
    if (uploadedFiles.length < 2) {
      setUploadedFiles((prev) => [...prev, file]);
    }
  };

  const handleFileRemove = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setProfileImage(url);
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    nextStep();
  };

  const steps = [
    {
      title: "welcome to connect³",
      subtitle: "let's get you set up in just a few steps",
      content: (
        <div className="space-y-8">
          <FileUploadCube
            onFileUpload={handleFileUpload}
            files={uploadedFiles}
            onFileRemove={handleFileRemove}
          />
          <div className="text-center space-y-2">
            <p className="text-white/80">
              share your resume/portfolio to quickstart your profile
            </p>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              Upload up to 2 files. Not up to date? No worries! You can always
              update them later.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "tell your story",
      subtitle: "help others understand what makes you unique",
      content: (
        <div className="space-y-6">
          <InteractiveTextArea value={description} onChange={setDescription} />
          <div className="text-center">
            <p className="text-white/50 text-sm max-w-lg mx-auto">
              Expand on what you uploaded, share your passions, or describe what
              you&nbsp;re working on. Write naturally - like you&nbsp;re talking
              to a friend!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "nearly there!",
      subtitle: "add a photo so people can recognize you",
      content: (
        <div className="space-y-8">
          <ProfilePicUpload
            onImageUpload={handleImageUpload}
            imageUrl={profileImage}
          />
          <div className="text-center space-y-2">
            <p className="text-white/80">Upload your profile picture</p>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              A friendly photo helps build trust and makes connections more
              personal.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, #7C3AED55 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-16 h-72 w-72 rounded-full blur-3xl opacity-15"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, #06B6D455 0%, transparent 70%)",
          }}
        />
      </div>

      <AnimatedParticles />

      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-white/10 grid place-items-center border border-white/10">
            <Box className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">
            connect<sup className="pl-0.5">3</sup>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-8 rounded-full transition-all duration-300 ${
                index <= currentStep ? "bg-white" : "bg-white/20"
              }`}
              animate={{ scale: index === currentStep ? 1.2 : 1 }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center space-y-12"
          >
            <div className="space-y-4">
              <motion.h1
                className="text-4xl md:text-5xl font-bold tracking-tight font-extrabold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {steps[currentStep].title}
              </motion.h1>
              <motion.p
                className="text-white/70 text-lg max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {steps[currentStep].subtitle}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="flex items-center justify-center gap-4 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <AnimatePresence>
            {currentStep > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={prevStep}
                className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all hover:scale-105 flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={skipStep}
            className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all hover:scale-105 flex items-center gap-2"
          >
            Skip for now
            <Skip className="h-4 w-4" />
          </button>

          {currentStep < 2 ? (
            <button
              onClick={nextStep}
              className="px-8 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                // Handle final submission
                if (!description.trim()) {
                  toast.error("Please tell us about yourself.");
                  return;
                }
                if (!profileImage) {
                  toast.error("Please upload a profile picture.");
                  return;
                }
                toast.success(
                  "Welcome to connect³! Profile created successfully"
                );
              }}
              className="px-8 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
            >
              Complete Setup
              <Check className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      </div>

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
    </div>
  );
}
