import { clubsData } from "@/components/clubs/ClubsData";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { ScrollableGallery } from "../ScrollableGallery";
import * as Tooltip from "@radix-ui/react-tooltip";

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
          <Tooltip.Provider delayDuration={300}>
            <ScrollableGallery
              autoCenter={true}
              centerKey="once" // Only center once on mount
              blurWidth="md"
              gap="lg"
              enableDrag={true}
              className="pb-10"
            >
              {collaboratingClubs.map((club, index) => (
                <Tooltip.Root key={club.id}>
                  <Tooltip.Trigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.6 + index * 0.1,
                        ease: "easeOut",
                      }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.1 }}
                      className="group relative flex-shrink-0 pointer-events-auto cursor-pointer"
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
                    </motion.div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-black/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg border border-white/20 whitespace-nowrap z-50"
                      sideOffset={8}
                      side="bottom"
                    >
                      {club.name}
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </ScrollableGallery>
          </Tooltip.Provider>
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
