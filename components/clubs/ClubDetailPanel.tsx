import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Building2, MapPin, Globe, ChevronLeft } from "lucide-react";
import { FaInstagram, FaLinkedin, FaFacebook, FaDiscord } from "react-icons/fa";
import { ClubData } from "./ClubsData";
import { ClubLink } from "./ClubLink";

const socialsIconMap: { [key: string]: React.ElementType } = {
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  facebook: FaFacebook,
  discord: FaDiscord,
};

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
      <div className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
        <div className="flex flex-row items-center sm:items-start gap-6">
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 flex-shrink-0 border-2 border-white/20 bg-secondary shadow-lg shadow-black/10 mx-auto sm:mx-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              {club.logoUrl ? (
                <Image
                  src={club.logoUrl}
                  alt={`${club.name} logo`}
                  width={80}
                  height={80}
                  className="object-contain max-h-16 sm:max-h-20 drop-shadow-lg"
                />
              ) : (
                <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-white/80" />
              )}
            </div>
          </div>
          <div className="flex-1 text-left min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 leading-tight">
              {club.name}
              <p className="font-normal text-xs text-muted sm:text-sm md:text-base mb-1 sm:mb-2 truncate overflow-hidden whitespace-nowrap">
                {club.full_name || club.name}
              </p>
            </h1>
            <p className="flex flex-row text-muted items-center justify-start text-base sm:text-lg mb-1.5 sm:mb-2">
              <MapPin className="inline-block w-4 h-4 mr-2" />
              {club.location}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">About</h2>
        <p className="leading-relaxed text-sm sm:text-base text-muted">
          {club.fullDescription}
        </p>
      </div>

      {/* Links */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
          <h2 className="text-lg sm:text-xl font-bold">Links</h2>
        </div>

        <div className="space-y-3">
          {club.links.website && (
            <ClubLink
              href={club.links.website}
              icon={<Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />}
              label="Official Website"
            />
          )}
          {club.links.club && (
            <ClubLink
              href={club.links.club}
              icon={
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
              }
              label="Club Page"
            />
          )}

          <h1 className="font-bold text-md sm:text-lg mb-2">Socials</h1>
          <div className="flex items-center gap-3 mt-3 ml-3">
            {/* Map club socials to their links and icons */}

            {club.socials &&
              Object.entries(club.socials).map(([platform, link]) => {
                const Icon = socialsIconMap[platform];
                return (
                  Icon && (
                    <a
                      key={platform}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors text-foreground hover:text-foreground/40"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                );
              })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
