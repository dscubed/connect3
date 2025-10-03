"use client";
import { SearchBar } from "@/components/home/SearchBar";
import { Box } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, animate, PanInfo } from "framer-motion";
import Image from "next/image";

const sections = [
  { id: "home", label: "Home" },
  { id: "use-cases", label: "Use cases" },
  { id: "benefits", label: "Benefits" },
  { id: "collaborations", label: "Collaborations" }, // <-- fix spelling here
];

const useCaseSections = [
  {
    id: "networking",
    label: "Networking",
    queries: [
      "Are there any networking events this week?",
      "I want to join a hackathon team, any teammates available?",
      "Who is working on cool AI projects?",
      "Looking for collaborators for a startup idea",
      "Which seniors can give advice on internships?",
      "Who else is interested in AI?",
      "Any upcoming math/AI competitions?",
      "I'm looking to start a robotics startup and need a cofounder who is skilled at backend development",
    ],
  },
  {
    id: "clubs",
    label: "Clubs",
    queries: [
      "What clubs should I join if I want to become a data scientist?",
      "Which clubs focus on sustainability?",
      "How do I join Data Science Student Society",
      "Are there any cultural clubs for international students?",
      "Which students are good at competitive programming?",
    ],
  },
  {
    id: "events",
    label: "Events",
    queries: [
      "Are there any events today that offers free coffee?",
      "What events are happening today related to AI?",
      "Which cafe's have student discounts?",
      "Which workshops are good for learning Python?",
      "Are there study groups for Data Science?",
      "Where do students hang out after lectures?",
      "Looking for teammates that are good at making reels to promote our submission",
    ],
  },
];

const benefits = [
  {
    id: "discovery",
    title: "Instant Discovery",
    description:
      "Your club is instantly discoverable by students searching for opportunities.",
  },
  {
    id: "setup",
    title: "Effortless Setup",
    description:
      "Get started in less than a minute—just add your website or socials.",
  },
  {
    id: "reach",
    title: "Wider Reach",
    description:
      "Connect with more students and boost your club’s visibility across campus.",
  },
  {
    id: "engagement",
    title: "Better Engagement",
    description:
      "Increase event attendance and member participation with targeted discovery.",
  },
  {
    id: "impact",
    title: "Community Impact",
    description:
      "Strengthen your club's impact by connecting with passionate students.",
  },
  {
    id: "automation",
    category: "Efficiency",
    title: "Let AI Handle the Busywork",
    description:
      "Automatically answer common questions, update event details, and notify interested students. Focus on building community, not managing spreadsheets.",
    image: "/Images/benefit-automation.jpg",
  },
];

const benefitsNew = [
  {
    id: "discovery",
    category: "Visibility",
    title: "Be Found Instantly",
    description:
      "Students searching for opportunities discover your club automatically. No more hoping they'll stumble upon your Instagram—Connect3 puts you right where they're looking.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=800&fit=crop&q=80", // Students studying/discovering
  },
  {
    id: "reach",
    category: "Growth",
    title: "Reach the Right Students",
    description:
      "Connect with students who are genuinely interested in what you offer. Our AI matches your club with students based on their passions, majors, and career goals.",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=800&fit=crop&q=80", // University campus aerial view
  },
  {
    id: "engagement",
    category: "Engagement",
    title: "Boost Event Turnout",
    description:
      "Get more students at your events with intelligent reminders and personalized recommendations. Turn one-time visitors into dedicated members.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop&q=80", // Conference/event gathering
  },
  {
    id: "setup",
    category: "Simplicity",
    title: "Set Up in 60 Seconds",
    description:
      "No complex forms or manual data entry. Just paste your club's website or social media link, and Connect3 does the rest. Start reaching students immediately.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=800&fit=crop&q=80", // Clean tech/coding setup
  },
  {
    id: "analytics",
    category: "Insights",
    title: "Understand Your Members",
    description:
      "See what students are searching for, which events get the most interest, and how your club compares. Make data-driven decisions to grow faster.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop&q=80", // Analytics dashboard/charts
  },
  {
    id: "automation2",
    category: "Efficiency",
    title: "Let AI Handle the Busywork",
    description:
      "Automatically answer common questions, update event details, and notify interested students. Focus on building community, not managing spreadsheets.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&q=80", // AI/futuristic technology
  },
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("home");

  // Home Section
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setCreating(true);
    // Simulate query creation (replace with your logic)
    setTimeout(() => setCreating(false), 1000);
    // You can navigate or trigger actions here
    // router.push(`/search?chatroom=demo`);
  };

  // Use Cases Section
  const [selectedUseCase, setSelectedUseCase] = useState(useCaseSections[0].id);

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Benefits Section
  const [activeBenefitIdx, setActiveBenefitIdx] = useState(0);
  // Gallery navigation handlers
  const prevBenefit = () => setActiveBenefitIdx((idx) => Math.max(0, idx - 1));
  const nextBenefit = () =>
    setActiveBenefitIdx((idx) => Math.min(benefits.length - 1, idx + 1));

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 2; // Use middle of viewport

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sticky Sidebar - Hidden on Mobile */}
      <aside className="hidden lg:flex w-64 bg-black border-r border-white/10 flex-col items-center py-8 h-screen sticky top-0">
        <div className="flex flex-row items-center justify-center mb-8">
          <Box className="h-10 w-10 text-white/80" />
          <span className="ml-2 text-lg font-extrabold">connect3</span>
        </div>
        <div className="flex-1" />
        <nav className="flex flex-col gap-4 w-full px-6 mb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`text-left px-2 py-1 rounded transition-all ${
                activeSection === section.id
                  ? "bg-white/10 text-white font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Logo - Shown only on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-30 flex items-center gap-2">
        <Box className="h-8 w-8 text-white/80" />
        <span className="text-base font-extrabold text-white">connect3</span>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-8">
        {/* Sticky Header */}
        <header className="w-full flex justify-end items-center mb-4 bg-transparent backdrop-blur-lg sticky top-0 z-20 py-4 px-2">
          <div className="flex gap-3 md:gap-4">
            <span className="text-white/70 self-center hidden sm:inline text-sm md:text-base">Contact</span>
            <button className="px-4 md:px-5 py-2 rounded-full bg-white text-black font-medium hover:bg-white/90 transition text-sm md:text-base">
              Log in
            </button>
            <button className="px-4 md:px-5 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium hover:from-gray-600 hover:to-gray-500 transition text-sm md:text-base">
              Sign up
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div id="home" className="w-full flex flex-col items-center justify-center min-h-[80vh] py-12 md:py-20">
          <section className="flex flex-col items-center w-full justify-center text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Discover clubs and opportunities
              <br />
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                with Connect3
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-3xl text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 mb-10 px-4"
            >
              Connect3 helps students at Unimelb instantly find clubs and
              opportunities, and makes it effortless for clubs to reach and
              engage new members.
            </motion.p>
          </section>
          
          {/* Hero Search Bar with Glow */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full flex justify-center items-center"
          >
            <div className="relative max-w-3xl w-full px-4">
              {/* Glow effect container */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-60 animate-pulse" />
              
              {/* Search bar */}
              <div className="relative rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black p-1 shadow-2xl">
                <div className="rounded-full bg-black px-6 py-4 md:px-8 md:py-6 shadow-[inset_0_0_20px_rgba(139,92,246,0.3)]">
                  <SearchBar
                    query={query}
                    setQuery={setQuery}
                    disabled={creating}
                    placeholder="Search for clubs, opportunities, or keywords..."
                    onSubmit={handleSearch}
                  />
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />
        
        {/* Use Cases Section - Responsive Card Layout */}
        <div
          id="use-cases"
          className="w-full flex flex-col items-center justify-center py-12 md:py-16"
        >
          <section className="w-full max-w-6xl mx-auto px-4 md:px-8">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-12 text-center">
              Discover Your Community
            </h3>
            
            {/* Use Case Tabs */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-12">
              {useCaseSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedUseCase(section.id)}
                  className={`px-5 md:px-6 py-2.5 md:py-3 rounded-full font-semibold transition-all border text-sm md:text-base
                    ${
                      selectedUseCase === section.id
                        ? "bg-white/15 text-white border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        : "bg-black/40 text-white/60 border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20"
                    }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            {/* Query Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {useCaseSections
                .find((section) => section.id === selectedUseCase)
                ?.queries.map((query, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 cursor-pointer group"
                  >
                    <p className="text-white/90 text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                      "{query}"
                    </p>
                  </motion.div>
                ))}
            </div>
          </section>
        </div>

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />

        {/* Benefits Section - Apple-style Draggable Carousel */}
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
              Join the platform that makes it effortless to reach, engage, and grow your community
            </p>
          </section>

          {/* Draggable Carousel Container */}
          <div className="w-full relative">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <motion.div
                drag="x"
                dragConstraints={{ left: -1800, right: 0 }}
                dragElastic={0.1}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                className="flex gap-5 md:gap-6 cursor-grab active:cursor-grabbing pb-8"
              >
                {benefitsNew.map((benefit, idx) => (
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

            {/* Scroll Hint for Desktop */}
            <div className="hidden md:flex items-center justify-center gap-3 mt-8 text-white/30 text-sm">
              <div className="flex gap-2">
                {benefitsNew.map((_, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 h-1.5 rounded-full bg-white/30 transition-all"
                  />
                ))}
              </div>
              <span>← Drag to explore →</span>
            </div>

            {/* Swipe Hint for Mobile */}
            <div className="flex md:hidden items-center justify-center gap-2 mt-6 text-white/30 text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span>Swipe to see more</span>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />

        {/* Collaborations Section */}
        <div
          id="collaborations"
          className="w-full flex flex-col items-center justify-center min-h-screen mb-12"
        >
          <section className="w-full max-w-3xl mx-auto text-center py-12">
            <h3 className="text-3xl font-bold mb-2">Collaborations</h3>
            <p className="text-white/70 mb-4">
              Cofounder is designed to be flexible, secure, and easy to use.
              Plug in your tools, set up automations, and let it work for you.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
