"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Mail,
  MapPin,
  Users,
  Target,
  Calendar,
  Globe,
  Sparkles,
  Building2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { clubsData, ClubData } from "@/components/clubs/ClubsData";

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
      className={`cursor-pointer rounded-xl border transition-all duration-200 ${
        isSelected
          ? "bg-white/10 border-white/30 shadow-lg"
          : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
      }`}
    >
      <div className="p-4 flex items-start gap-4">
        {/* Logo */}
        <div
          className={`${club.color} rounded-lg p-3 flex-shrink-0 border border-white/20`}
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg mb-1 truncate">
            {club.name}
          </h3>
          <p className="text-white/60 text-sm mb-2 line-clamp-2">
            {club.tagline}
          </p>
          <div className="flex flex-wrap gap-2">
            {club.focus.slice(0, 2).map((area, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-md text-xs bg-white/10 text-white/80 border border-white/20"
              >
                {area}
              </span>
            ))}
            {club.focus.length > 2 && (
              <span className="px-2 py-1 rounded-md text-xs bg-white/10 text-white/80 border border-white/20">
                +{club.focus.length - 2} more
              </span>
            )}
          </div>
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
      <div
        className={`relative rounded-2xl bg-gradient-to-br ${club.bgGradient} p-8 mb-6 border border-white/20`}
      >
        <div className="flex items-start gap-6">
          <div
            className={`${club.color} rounded-2xl p-4 flex-shrink-0 border-2 border-white/30`}
          >
            <div className="w-20 h-20 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{club.name}</h1>
            <p className="text-xl text-white/80 italic mb-4">{club.tagline}</p>
            {club.established && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30">
                <Calendar className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">
                  Est. {club.established}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">About</h2>
        <p className="text-white/80 leading-relaxed">{club.fullDescription}</p>
      </div>

      {/* Focus Areas */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-white/60" />
          <h2 className="text-xl font-bold text-white">Focus Areas</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {club.focus.map((area, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white border border-white/20"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-white/60" />
          <h2 className="text-xl font-bold text-white">What We Do</h2>
        </div>
        <ul className="space-y-3">
          {club.activities.map((activity, idx) => (
            <li key={idx} className="flex items-start gap-3 text-white/80">
              <span className="text-white/40 mt-1 flex-shrink-0">•</span>
              <span>{activity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Goals */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-white/60" />
          <h2 className="text-xl font-bold text-white">Our Goals</h2>
        </div>
        <ul className="space-y-3">
          {club.goals.map((goal, idx) => (
            <li key={idx} className="flex items-start gap-3 text-white/80">
              <span className="text-white/40 mt-1 flex-shrink-0">→</span>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Leadership */}
      {club.leadership && (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-white/60" />
            <h2 className="text-xl font-bold text-white">Leadership Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {club.leadership.president && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">
                  President
                </p>
                <p className="text-white font-medium">
                  {club.leadership.president}
                </p>
              </div>
            )}
            {club.leadership.secretary && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">
                  Secretary
                </p>
                <p className="text-white font-medium">
                  {club.leadership.secretary}
                </p>
              </div>
            )}
            {club.leadership.treasurer && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">
                  Treasurer
                </p>
                <p className="text-white font-medium">
                  {club.leadership.treasurer}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Get In Touch</h2>
        <div className="space-y-4">
          {club.contact.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-white/60 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">
                  Email
                </p>
                <a
                  href={`mailto:${club.contact.email}`}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {club.contact.email}
                </a>
              </div>
            </div>
          )}
          {club.contact.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-white/60 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">
                  Location
                </p>
                <p className="text-white/80">{club.contact.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-white/60" />
          <h2 className="text-xl font-bold text-white">Links</h2>
        </div>
        <div className="space-y-3">
          {club.links.website && (
            <a
              href={club.links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-white/60" />
                <span className="text-white font-medium">Official Website</span>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
            </a>
          )}
          {club.links.umsu && (
            <a
              href={club.links.umsu}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-white/60" />
                <span className="text-white font-medium">UMSU Club Page</span>
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
          <div className="border-b border-white/10 p-6 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Clubs</h1>
            </div>
            <p className="text-white/60 text-sm">
              {clubsData.length} clubs at University of Melbourne
            </p>
          </div>

          {/* Club List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
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
