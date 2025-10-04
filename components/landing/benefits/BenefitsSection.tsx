import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { benefits } from "./benefits";

export function BenefitsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToCard = (index: number) => {
    const container = scrollContainerRef.current;
    const card = cardRefs.current[index];

    if (container && card) {
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;

      // Calculate the position to center the card
      const cardCenter =
        cardRect.left - containerRect.left + scrollLeft + cardRect.width / 2;
      const containerCenter = containerRect.width / 2;
      const targetScrollLeft = cardCenter - containerCenter;

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      id="benefits"
      className="w-full flex flex-col items-center justify-center py-20 overflow-hidden"
    >
      {/* Header */}
      <section className="w-full max-w-6xl mx-auto text-center mb-16 px-4 md:px-8">
        <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
          Why clubs choose Connect3
        </h3>
        <p className="text-lg md:text-xl lg:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">
          Join the platform that makes it effortless to reach, engage, and grow
          your community
        </p>
      </section>

      {/* Scrollable Carousel Container */}
      <div className="w-full relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div
              className="flex gap-5 md:gap-6 pb-8"
              style={{ width: "max-content" }}
            >
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={benefit.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => scrollToCard(idx)}
                  className="flex-shrink-0 w-[80vw] sm:w-[340px] md:w-[380px] lg:w-[420px] cursor-pointer"
                >
                  <div className="relative h-[440px] md:h-[480px] rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent border border-white/10 backdrop-blur-sm shadow-2xl transition-all duration-300 hover:border-white/25 hover:shadow-[0_0_80px_rgba(255,255,255,0.15)]">
                    {/* Image Container with Gradient Overlay */}
                    <div className="relative h-[240px] md:h-[260px] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 z-10" />
                      <Image
                        src={benefit.image}
                        alt={benefit.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 80vw, (max-width: 768px) 340px, (max-width: 1024px) 380px, 420px"
                        priority={idx < 2}
                      />
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 md:top-5 md:left-5 z-20">
                        <motion.span
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                          className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xl border border-white/30 text-white shadow-lg"
                        >
                          {benefit.category}
                        </motion.span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 md:p-6 flex flex-col justify-between h-[200px] md:h-[220px]">
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 leading-tight">
                          {benefit.title}
                        </h4>
                        <p className="text-sm md:text-base text-white/70 leading-relaxed line-clamp-4">
                          {benefit.description}
                        </p>
                      </div>
                    </div>

                    {/* Glassmorphic Accent Border */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Hint for Desktop */}
        <div className="hidden md:flex flex-col items-center justify-center gap-3 mt-8 text-white/30 text-sm">
          <div className="flex gap-2">
            {benefits.map((_, idx) => (
              <div
                key={idx}
                className="w-1.5 h-1.5 rounded-full bg-white/30 transition-all cursor-pointer hover:bg-white/50"
                onClick={() => scrollToCard(idx)}
              />
            ))}
          </div>
          <span>← Click or scroll to explore →</span>
        </div>

        {/* Swipe Hint for Mobile */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-6 text-white/30 text-xs">
          <span>Swipe to see more →</span>
        </div>
      </div>
    </div>
  );
}
