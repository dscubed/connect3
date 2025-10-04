import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const benefits = [
  {
    id: "discovery",
    category: "Visibility",
    title: "Be Found Instantly",
    description:
      "Students searching for opportunities discover your club automatically. No more hoping they'll stumble upon your Instagram—Connect3 puts you right where they're looking.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=800&fit=crop&q=80", // Students studying/discovering
  },
  {
    id: "reach",
    category: "Growth",
    title: "Reach the Right Students",
    description:
      "Connect with students who are genuinely interested in what you offer. Our AI matches your club with students based on their passions, majors, and career goals.",
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=800&fit=crop&q=80", // University campus aerial view
  },
  {
    id: "engagement",
    category: "Engagement",
    title: "Boost Event Turnout",
    description:
      "Get more students at your events with intelligent reminders and personalized recommendations. Turn one-time visitors into dedicated members.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop&q=80", // Conference/event gathering
  },
  {
    id: "setup",
    category: "Simplicity",
    title: "Set Up in 60 Seconds",
    description:
      "No complex forms or manual data entry. Just paste your club's website or social media link, and Connect3 does the rest. Start reaching students immediately.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=800&fit=crop&q=80", // Clean tech/coding setup
  },
  {
    id: "analytics",
    category: "Insights",
    title: "Understand Your Members",
    description:
      "See what students are searching for, which events get the most interest, and how your club compares. Make data-driven decisions to grow faster.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop&q=80", // Analytics dashboard/charts
  },
  {
    id: "automation2",
    category: "Efficiency",
    title: "Let AI Handle the Busywork",
    description:
      "Automatically answer common questions, update event details, and notify interested students. Focus on building community, not managing spreadsheets.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&q=80", // AI/futuristic technology
  },
];

export function BenefitsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
            <motion.div
              drag="x"
              dragConstraints={{ left: -1800, right: 0 }}
              dragElastic={0.1}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              className="flex gap-5 md:gap-6 cursor-grab active:cursor-grabbing pb-8"
              style={{ width: "max-content" }}
            >
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ scale: 1.03 }}
                  className="flex-shrink-0 w-[80vw] sm:w-[340px] md:w-[380px] lg:w-[420px]"
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
            </motion.div>
          </div>
        </div>

        {/* Scroll Hint for Desktop */}
        <div className="hidden md:flex flex-col items-center justify-center gap-3 mt-8 text-white/30 text-sm">
          <div className="flex gap-2">
            {benefits.map((_, idx) => (
              <div
                key={idx}
                className="w-1.5 h-1.5 rounded-full bg-white/30 transition-all"
              />
            ))}
          </div>
          <span>← Drag or scroll to explore →</span>
        </div>

        {/* Swipe Hint for Mobile */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-6 text-white/30 text-xs">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
          <span>Swipe or scroll to see more</span>
        </div>
      </div>
    </div>
  );
}
