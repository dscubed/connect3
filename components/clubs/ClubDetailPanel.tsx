import { motion } from "framer-motion";
import Image from "next/image";
import {
  Building2,
  MapPin,
  Calendar,
  Globe,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { ClubData } from "./ClubsData";

export function ClubDetailPanel({
  club,
  onBack,
}: {
  club: ClubData;
  onBack?: () => void;
}) {
  return (
    <motion.div
      key={club.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto scrollbar-hide"
    >
      {/* Mobile Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="lg:hidden mt-12 flex items-center gap-2 text-white/60 hover:text-white mb-4 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back to clubs</span>
        </button>
      )}

      {/* Header with Logo */}
      <div className="relative rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 border border-white/15 shadow-xl shadow-black/10">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex-shrink-0 border-2 border-white/20 bg-white/5 shadow-lg shadow-black/10 mx-auto sm:mx-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              {club.logoUrl ? (
                <Image
                  src={
                    club.logoUrl ||
                    process.env.NEXT_PUBLIC_PLACEHOLDER_AVATAR_URL ||
                    ""
                  }
                  alt={`${club.name} logo`}
                  width={80}
                  height={80}
                  className="object-contain max-h-16 sm:max-h-20"
                />
              ) : (
                <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-white/80" />
              )}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight">
              {club.name}
            </h1>
            <p className="flex flex-row items-center justify-center sm:justify-start text-base sm:text-lg text-white/70 mb-3 sm:mb-4">
              <MapPin className="inline-block w-4 h-4 mr-2" />
              {club.location}
            </p>
            {club.established && (
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 border border-white/20 shadow-md shadow-black/5">
                <Calendar className="w-4 h-4 text-white/80" />
                <span className="text-xs sm:text-sm text-white/90 font-medium">
                  Est. {club.established}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/[0.04] rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6 shadow-lg shadow-black/5">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
          About
        </h2>
        <p className="text-white/70 leading-relaxed text-sm sm:text-[15px]">
          {club.fullDescription}
        </p>
      </div>

      {/* Links */}
      <div className="bg-white/[0.04] rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6 shadow-lg shadow-black/5">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Links</h2>
        </div>
        <div className="space-y-3">
          {club.links.website && (
            <a
              href={club.links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all group shadow-sm hover:shadow-md shadow-black/5"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                <span className="text-white/90 font-medium text-sm sm:text-base">
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
              className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all group shadow-sm hover:shadow-md shadow-black/5"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                <span className="text-white/90 font-medium text-sm sm:text-base">
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
