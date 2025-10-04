import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { benefits } from "./benefits";

export function BenefitsSection() {
  const [animationPlayState, setAnimationPlayState] = useState<'running' | 'paused'>('running');

  const handleMouseEnter = () => {
    setAnimationPlayState('paused');
  };

  const handleMouseLeave = () => {
    setAnimationPlayState('running');
  };

  return (
    <div id="benefits" className="w-full flex flex-col items-center justify-center py-2 overflow-hidden px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-pink-500/8 to-blue-500/3 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full">
        <section className="w-full max-w-5xl mx-auto text-center mb-4">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent px-4">
            Why Choose Connect3
          </h3>
          <p className="text-xs md:text-sm text-white/60 max-w-2xl mx-auto leading-relaxed px-4">
            The platform that makes it effortless to reach and engage your community
          </p>
        </section>

        <div className="w-full relative">
          <div className="max-w-[calc(240px*3+2rem)] sm:max-w-[calc(260px*3+3rem)] lg:max-w-[calc(280px*3+4rem)] mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex gap-2 sm:gap-3 lg:gap-4 pb-6"
                style={{
                  width: 'max-content',
                  animation: 'infiniteScroll 30s linear infinite',
                  animationPlayState: animationPlayState,
                  transition: 'animation-play-state 0.3s ease',
                  willChange: 'transform'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {[...benefits, ...benefits, ...benefits].map((benefit, idx) => (
                  <motion.div
                    key={benefit.id + "-" + idx + "-" + Math.floor(idx / benefits.length)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (idx % benefits.length) * 0.08, duration: 0.4 }}
                    viewport={{ once: true, margin: "-100px" }}
                    whileHover={{ scale: 1.03 }}
                    className="flex-shrink-0 w-[60vw] sm:w-[240px] md:w-[260px] lg:w-[280px] cursor-pointer"
                  >
                    <div className="relative h-[280px] sm:h-[300px] lg:h-[320px] rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent border border-white/10 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-white/25">
                      <div className="relative h-[140px] sm:h-[160px] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 z-10" />
                        <Image
                          src={benefit.image}
                          alt={benefit.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 70vw, (max-width: 768px) 260px, 280px"
                          priority={idx < 2}
                        />
                        <div className="absolute top-3 left-3 z-20">
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xl border border-white/30 text-white shadow-lg">
                            {benefit.category}
                          </span>
                        </div>
                      </div>
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
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
