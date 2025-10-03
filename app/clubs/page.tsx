"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  MapPin,
  Users,
  Calendar,
  Globe,
  Building2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { clubsData, type ClubData } from "@/components/clubs/ClubsData";
import Image from "next/image";

function ClubListCard({
  club,
  isSelected,
  onClick,
}: {
  club: ClubData;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border transition-all duration-300 ${
        isSelected
          ? "bg-white/[0.08] border-white/20 shadow-xl shadow-black/10"
          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/15 hover:shadow-lg hover:shadow-black/5"
      }`}
    >
      <div className="p-5 flex items-start gap-4">
        {/* Logo */}
        <div
          className={`rounded-xl p-3 flex-shrink-0 border ${
            isSelected
              ? "border-white/25 bg-white/5"
              : "border-white/15 bg-white/[0.02]"
          }`}
        >
          <div className="w-12 h-12 flex items-center justify-center">
            {club.logoUrl ? (
              <Image
                src={club.logoUrl || "/placeholder.svg"}
                alt={`${club.name} logo`}
                width={48}
                height={48}
                className="object-contain max-h-12"
              />
            ) : (
              <Building2 className="w-12 h-12 text-white/80" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base mb-1.5 truncate">
            {club.name}
          </h3>
          <p className="text-white/50 text-sm line-clamp-2 leading-relaxed">
            {club.location}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ClubDetailPanel({ club }: { club: ClubData }) {
  return (
    <motion.div
      key={club.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto scrollbar-hide"
    >
      {/* Header with Logo */}
      <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-8 mb-6 border border-white/15 shadow-xl shadow-black/10">
        <div className="flex items-start gap-6">
          <div className="rounded-2xl p-4 flex-shrink-0 border-2 border-white/20 bg-white/5 shadow-lg shadow-black/10">
            <div className="w-20 h-20 flex items-center justify-center">
              {club.logoUrl ? (
                <Image
                  src={club.logoUrl || "/placeholder.svg"}
                  alt={`${club.name} logo`}
                  width={80}
                  height={80}
                  className="object-contain max-h-20"
                />
              ) : (
                <Building2 className="w-20 h-20 text-white/80" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
              {club.name}
            </h1>
            <p className="flex flex-row items-center text-lg text-white/70 mb-4">
              <MapPin className="inline-block w-4 h-4 mr-2" />
              {club.location}
            </p>
            {club.established && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-md shadow-black/5">
                <Calendar className="w-4 h-4 text-white/80" />
                <span className="text-sm text-white/90 font-medium">
                  Est. {club.established}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-7 mb-6 shadow-lg shadow-black/5">
        <h2 className="text-xl font-bold text-white mb-4">About</h2>
        <p className="text-white/70 leading-relaxed text-[15px]">
          {club.fullDescription}
        </p>
      </div>

      {/* Links */}
      <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-7 mb-6 shadow-lg shadow-black/5">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="h-5 w-5 text-white/60" />
          <h2 className="text-xl font-bold text-white">Links</h2>
        </div>
        <div className="space-y-3">
          {club.links.website && (
            <a
              href={club.links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all group shadow-sm hover:shadow-md shadow-black/5"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-white/60" />
                <span className="text-white/90 font-medium">
                  Official Website
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
            </a>
          )}
          {club.links.umsu && (
            <a
              href={club.links.umsu}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all group shadow-sm hover:shadow-md shadow-black/5"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-white/60" />
                <span className="text-white/90 font-medium">
                  UMSU Club Page
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ClubsPage() {
  const [selectedClub, setSelectedClub] = useState<ClubData>(clubsData[0]);

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Club List */}
        <div className="w-full md:w-96 lg:w-[450px] border-r border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b border-white/10 p-7 flex-shrink-0 bg-black/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-11 w-11 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center shadow-lg shadow-black/10">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Clubs</h1>
            </div>
            <p className="text-white/50 text-sm font-medium">
              {clubsData.length} clubs at University of Melbourne
            </p>
          </div>

          {/* Club List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
            {clubsData.map((club) => (
              <ClubListCard
                key={club.id}
                club={club}
                isSelected={selectedClub.id === club.id}
                onClick={() => setSelectedClub(club)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Club Details */}
        <div className="flex-1 bg-black overflow-hidden">
          <div className="h-full overflow-y-auto p-6 lg:p-8 scrollbar-hide">
            <AnimatePresence mode="wait">
              <ClubDetailPanel club={selectedClub} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
