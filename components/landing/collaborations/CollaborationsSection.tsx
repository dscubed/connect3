import { clubsData } from "@/components/clubs/ClubsData";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import Link from "next/link";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useState, useRef, useEffect, useMemo } from "react";

export function CollaborationsSection() {
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [animationPlayState, setAnimationPlayState] = useState<'running' | 'paused'>('running');
  
  // Memoize clubs data for better performance
  const collaboratingClubs = useMemo(() => 
    clubsData
      .filter((club) => club.logoUrl)
      .slice(0, 15), // Increased to 15 for better variety
    []
  );

  // Smooth pause/resume functions
  const smoothPause = () => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    setAnimationPlayState('paused');
    setIsPaused(true);
  };

  const smoothResume = (delay: number = 800) => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setAnimationPlayState('running');
      setIsPaused(false);
    }, delay);
  };

  // Handle smooth interactions
  const handleMouseEnter = () => {
    if (!isDragging) {
      smoothPause();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      smoothResume(1000);
    } else {
      smoothResume(600);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    smoothPause();
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      smoothResume(1200);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      id="collaborations"
      className="w-full flex flex-col items-center justify-center py-2 px-4 relative"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      
      <div className="relative z-10 w-full">
      <section className="w-full max-w-5xl mx-auto text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent px-4"
        >
          Trusted by Student Leaders
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-white/60 text-xs md:text-sm mb-4 max-w-2xl mx-auto px-4"
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
          className="mb-4 w-full"
        >
          <Tooltip.Provider delayDuration={200}>
            {/* Wider container to show 5 clubs */}
            <div className="max-w-[calc(120px*5+4rem)] sm:max-w-[calc(130px*5+5rem)] lg:max-w-[calc(140px*5+6rem)] mx-auto">
              <div 
                className="overflow-hidden"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                <div
                  className="flex gap-4 sm:gap-5 lg:gap-6 pb-6"
                  style={{
                    width: 'max-content',
                    animation: 'infiniteScroll 25s linear infinite',
                    animationPlayState: animationPlayState,
                    transition: 'animation-play-state 0.3s ease'
                  }}
                >
                  {/* Triple clubs for extra smooth infinite scroll */}
                  {[...collaboratingClubs, ...collaboratingClubs, ...collaboratingClubs].map((club, index) => (
                    <Tooltip.Root key={club.id + "-" + index}>
                      <Tooltip.Trigger asChild>
                        <Link 
                          href={"/clubs?club=" + club.id}
                          prefetch={false}
                          className="block"
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.3 + (index % collaboratingClubs.length) * 0.05,
                              ease: "easeOut",
                            }}
                            viewport={{ once: true }}
                            whileHover={{ 
                              scale: 1.08,
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ 
                              scale: 0.98,
                              transition: { duration: 0.1 }
                            }}
                            className="group relative flex-shrink-0 pointer-events-auto cursor-pointer"
                          >
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/10 p-3 sm:p-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20">
                              {club.logoUrl ? (
                                <Image
                                  src={club.logoUrl}
                                  alt={club.name + " logo"}
                                  width={60}
                                  height={60}
                                  className="object-contain max-w-full max-h-full filter brightness-90 group-hover:brightness-100 transition-all duration-300"
                                  loading="lazy"
                                  sizes="(max-width: 640px) 60px, (max-width: 1024px) 70px, 80px"
                                />
                              ) : (
                                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-white/60 group-hover:text-white/80 transition-colors" />
                              )}
                            </div>
                          </motion.div>
                        </Link>
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
                </div>
              </div>
            </div>
          </Tooltip.Provider>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          viewport={{ once: true }}
          className="flex flex-row sm:flex-row gap-3 mt-4 justify-center items-center"
        >
          <Link href="mailto:president@dscubed.org.au?subject=Student Club Join Request | Connect3&body=Hi there!%0D%0A%0D%0A Our club: {club name} is interested in joining Connect3.%0D%0A%0D%0A Here is our club email address: {club email address}.">
            <button className="w-full sm:w-auto px-5 py-2.5 md:px-6 md:py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-white/15 group">
              <span className="text-xs md:text-sm font-medium text-white/90 group-hover:text-white">
                Join the Community
              </span>
            </button>
          </Link>

          <Link href="/clubs">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-xl bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group">
              <span className="text-xs md:text-sm font-medium">
                View All Clubs
              </span>
            </button>
          </Link>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
