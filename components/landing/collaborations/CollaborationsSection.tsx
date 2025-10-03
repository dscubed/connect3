import { clubsData } from "@/components/clubs/ClubsData";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import Link from "next/link";

export function CollaborationsSection() {
  const collaboratingClubs = clubsData
    .filter((club) => club.logoUrl)
    .slice(0, 12); // Show first 12 clubs with logos

  return (
    <div
      id="collaborations"
      className="w-full flex flex-col items-center justify-center min-h-[80vh] mb-12"
    >
      <section className="w-full max-w-6xl mx-auto text-center py-12 px-4">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
        >
          Collaborations
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-white/70 text-lg md:text-xl mb-12 max-w-3xl mx-auto"
        >
          Connect3 is backed and trusted by leading clubs all around Australia.
          Join our growing community of student groups.
        </motion.p>

        {/* Club Logos Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-8 w-full"
        >
          <div className="relative w-full">
            {/* Left blur fade */}
            <div className="absolute left-0 top-0 z-10 w-6 md:w-16 h-full bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />

            {/* Right blur fade */}
            <div className="absolute right-0 top-0 z-10 w-6 md:w-16 h-full bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none" />

            <div
              className="w-full overflow-x-auto scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              ref={(el) => {
                if (el) {
                  const container = el;
                  const scrollWidth = container.scrollWidth;
                  const clientWidth = container.clientWidth;
                  const centerPosition = (scrollWidth - clientWidth) / 2;
                  container.scrollLeft = centerPosition;
                }
              }}
            >
              <div className="flex gap-6 md:gap-8 items-center justify-center py-4 pb-10">
                {/* Empty spacer - LEFT */}
                <div className="flex-shrink-0 w-8"></div>

                {collaboratingClubs.map((club, index) => (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.6 + index * 0.1,
                      ease: "easeOut",
                    }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                    className="group relative flex-shrink-0"
                  >
                    <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/10 p-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20">
                      {club.logoUrl ? (
                        <Image
                          src={club.logoUrl}
                          alt={`${club.name} logo`}
                          width={80}
                          height={80}
                          className="object-contain max-w-full max-h-full filter brightness-90 group-hover:brightness-100 transition-all duration-300"
                        />
                      ) : (
                        <Building2 className="w-10 h-10 text-white/60 group-hover:text-white/80 transition-colors" />
                      )}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      <div className="bg-black/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg border border-white/20 whitespace-nowrap">
                        {club.name}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty spacer - RIGHT */}
                <div className="flex-shrink-0 w-8"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Link href="mailto:president@dscubed.org.au?subject=Student Club Join Request | Connect3&body=Hi there!%0D%0A%0D%0A Our club: {club name} is interested in joining Connect3.%0D%0A%0D%0A Here is our club email address: {club email address}.">
            <button className="px-8 py-4 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-white/[0.12] group">
              <span className="text-white/90 group-hover:text-white font-medium">
                Join the Community
              </span>
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
