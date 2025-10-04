import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect } from "react";
import { benefits } from "./benefits";
// @ts-ignore
import { Splide, SplideSlide } from '@splidejs/react-splide';

export function BenefitsSectionSplide() {
  const splideRef = useRef<any>(null);

  const handleMouseEnter = () => {
    if (splideRef.current?.splide) {
      splideRef.current.splide.Components.Autoplay.pause();
    }
  };

  const handleMouseLeave = () => {
    if (splideRef.current?.splide) {
      splideRef.current.splide.Components.Autoplay.play();
    }
  };

  // Ensure autoplay starts immediately when component mounts
  useEffect(() => {
    const initSplide = () => {
      if (splideRef.current?.splide) {
        // Start from beginning
        splideRef.current.splide.go(0);
        // Ensure autoplay is running
        splideRef.current.splide.Components.Autoplay.play();
      }
    };
    
    // Try immediately
    initSplide();
    
    // Also try after a short delay in case Splide isn't ready
    const timer = setTimeout(initSplide, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      id="benefits"
      className="w-full flex flex-col items-center justify-center py-2 overflow-hidden px-4 relative"
    >
      {/* Rich background with multiple layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-pink-500/8 to-blue-500/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-96 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      
      <div className="relative z-10 w-full">
        {/* Header */}
        <section className="w-full max-w-5xl mx-auto text-center mb-4">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent px-4">
            Why Choose Connect3
          </h3>
          <p className="text-xs md:text-sm text-white/60 max-w-2xl mx-auto leading-relaxed px-4">
            The platform that makes it effortless to reach and engage your community
          </p>
        </section>

        {/* Splide Carousel Container */}
        <div className="w-full relative">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-8">
            <Splide
              ref={splideRef}
              options={{
                type: 'loop',
                drag: true,
                autoplay: true,
                interval: 2000, // Faster than before - 2s intervals
                speed: 800, // Faster transitions
                easing: 'ease',
                pauseOnHover: true,
                pauseOnFocus: true,
                resetProgress: false,
                arrows: false,
                pagination: false,
                perPage: 2.8,
                perMove: 1,
                gap: '1.5rem',
                focus: 'center',
                trimSpace: false,
                rewind: false,
                rewindByDrag: false,
                updateOnMove: true,
                breakpoints: {
                  1024: {
                    perPage: 2.2,
                    gap: '1rem',
                    interval: 1800,
                  },
                  768: {
                    perPage: 1.6,
                    gap: '0.75rem',
                    interval: 1500,
                  },
                  640: {
                    perPage: 1.1,
                    gap: '0.5rem',
                    interval: 1200,
                  },
                  480: {
                    perPage: 1,
                    gap: '0.5rem',
                    interval: 1200,
                  },
                },
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="benefits-splide pb-6"
            >
              {/* Multiple sets of benefits for truly infinite scroll */}
              {[
                ...benefits, 
                ...benefits, 
                ...benefits,
                ...benefits
              ].map((benefit, idx) => (
                <SplideSlide key={`${benefit.id}-${idx}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (idx % benefits.length) * 0.08, duration: 0.4 }}
                    viewport={{ once: true, margin: "-100px" }}
                    whileHover={{ scale: 1.03 }}
                    className="w-full cursor-pointer"
                  >
                    <div className="relative h-[280px] sm:h-[300px] lg:h-[320px] rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent border border-white/10 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-white/25 hover:shadow-[0_0_50px_rgba(255,255,255,0.15)]">
                      {/* Image Container with Gradient Overlay */}
                      <div className="relative h-[140px] sm:h-[160px] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 z-10" />
                        <Image
                          src={benefit.image}
                          alt={benefit.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 640px) 60vw, (max-width: 768px) 240px, 280px"
                          priority={(idx % benefits.length) < 2}
                        />
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 z-20">
                          <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (idx % benefits.length) * 0.1 }}
                            className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xl border border-white/30 text-white shadow-lg"
                          >
                            {benefit.category}
                          </motion.span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-3 sm:p-4 flex flex-col justify-between h-[140px] sm:h-[140px] lg:h-[160px]">
                        <div>
                          <h4 className="text-base md:text-lg font-bold text-white mb-2 leading-tight">
                            {benefit.title}
                          </h4>
                          <p className="text-xs md:text-sm text-white/70 leading-relaxed line-clamp-3">
                            {benefit.description}
                          </p>
                        </div>
                      </div>

                      {/* Glassmorphic Accent Border */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
                    </div>
                  </motion.div>
                </SplideSlide>
              ))}
            </Splide>
          </div>

          {/* Navigation Dots */}
          <div className="hidden md:flex flex-col items-center justify-center gap-2 mt-4 text-white/30 text-xs">
            <div className="flex gap-2">
              {benefits.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (splideRef.current?.splide) {
                      splideRef.current.splide.go(idx);
                    }
                  }}
                  className="w-1 h-1 rounded-full bg-white/30 transition-all cursor-pointer hover:bg-white/50"
                />
              ))}
            </div>
            <span>← Swipe to explore →</span>
          </div>

          {/* Mobile Swipe Hint */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-4 text-white/30 text-xs">
            <span>Swipe to see more →</span>
          </div>
        </div>
      </div>
    </div>
  );
}