"use client";
import { SearchBar } from "@/components/home/SearchBar";
import { Box, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

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
    title: "Smart Automation",
    description:
      "Let Connect3 handle the busywork so you can focus on building your club.",
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
      {/* Sticky Sidebar */}
      <aside className="w-64 bg-black border-r border-white/10 flex flex-col items-center py-8 h-screen sticky top-0">
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Sticky Header */}
        <header className="w-full flex justify-end items-center mb-4 bg-transparent backdrop-blur-lg sticky top-0 z-20 py-4 px-2 ">
          <div className="flex gap-4 ml-8">
            <span className="text-white/70 self-center">Contact</span>
            <button className="px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-white/80 transition">
              Log in
            </button>
            <button className="px-4 py-2 rounded-full bg-gray-500 text-gray-300 font-medium hover:bg-gray-400/80 hover:text-black transition">
              Sign up
            </button>
          </div>
        </header>

        <div id="home" className="w-full flex flex-col items-center mt-12">
          <section className="flex flex-col items-center w-full justify-center text-center mb-6">
            <h2 className="w-4/5 text-5xl font-bold mb-4 leading-tight font-serif">
              Discover clubs and opportunities
              <br />
              <span className="text-white">with Connect3</span>
            </h2>
            <p className="w-2/3 text-lg text-white/70 mb-6">
              Connect3 helps students at Unimelb instantly find clubs and
              opportunities, and makes it effortless for clubs to reach and
              engage new members.
            </p>
          </section>
          <section className="w-full flex justify-center items-center my-12">
            <div className="rounded-full bg-gradient-to-br from-gray-500 via-zinc-500 to-gray-500 p-1 shadow-[0_0_40px_10px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_15px_rgba(99,102,241,0.4)] flex items-center justify-center">
              <div className="rounded-full bg-black p-6 w-[520px] max-w-full flex items-center justify-center shadow-[0_0_32px_4px_rgba(139,92,246,0.3)]">
                <SearchBar
                  query={query}
                  setQuery={setQuery}
                  disabled={creating}
                  placeholder="Search for clubs, opportunities, or keywords..."
                  onSubmit={handleSearch}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />
        {/* Use Cases Section */}
        <div
          id="use-cases"
          className="w-full flex flex-col items-center justify-center"
        >
          <section className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 py-12">
            {/* Left: Use Case Headers */}
            <div className="flex flex-col gap-4 w-full md:w-1/3">
              <h3 className="text-3xl font-bold mb-4">Use Cases</h3>
              {useCaseSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedUseCase(section.id)}
                  className={`text-left px-4 py-3 rounded-xl font-semibold transition-all border border-white/10
                    ${
                      selectedUseCase === section.id
                        ? "bg-white/10 text-white shadow-lg"
                        : "bg-black text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
            {/* Right: Queries List */}
            <div className="flex-1 bg-white/5 rounded-xl p-6 shadow-lg min-h-[320px]">
              <h4 className="text-xl font-bold mb-4">
                Example queries for{" "}
                {useCaseSections.find((s) => s.id === selectedUseCase)?.label}
              </h4>
              <ul className="space-y-3">
                {useCaseSections
                  .find((section) => section.id === selectedUseCase)
                  ?.queries.map((query, idx) => (
                    <li
                      key={idx}
                      className="bg-black/30 rounded-lg px-4 py-2 text-white/90 border border-white/10"
                    >
                      {query}
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        </div>

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />

        {/* Benefits Section */}
        <div
          id="benefits"
          className="w-full flex flex-col items-center justify-center min-h-screen"
        >
          <section className="w-full max-w-3xl mx-auto text-center py-12">
            <h3 className="text-3xl font-bold mb-2">Benefits</h3>
            <p className="text-white/70 mb-4">
              Connect3 makes it effortless for clubs to reach, engage, and grow
              their community.
            </p>
          </section>
          {/* Gallery */}
          <div className="relative w-full max-w-4xl h-[340px] flex items-center justify-center mb-8 overflow-visible">
            {/* Prev Button */}
            <button
              onClick={prevBenefit}
              disabled={activeBenefitIdx === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3 shadow-lg hover:bg-white/40 transition-all z-20"
              aria-label="Previous"
            >
              <span className="text-2xl font-bold">
                <ChevronLeft />
              </span>
            </button>
            {/* Gallery Cards */}
            {benefits.map((benefit, idx) => {
              const offset = idx - activeBenefitIdx;
              if (offset === 0) {
                // Center card
                return (
                  <div
                    key={benefit.id}
                    className="absolute left-1/2 -translate-x-1/2 z-10 bg-white/10 rounded-3xl p-14 shadow-2xl flex flex-col items-center max-w-2xl w-full transition-all scale-105 opacity-100"
                    style={{
                      boxShadow: "0 0 80px 0 rgba(255,255,255,0.35)",
                      border: "2px solid rgba(255,255,255,0.18)",
                      transform: "translateX(0) scale(1.05)",
                    }}
                  >
                    <span className="text-5xl font-extrabold mb-6 text-white text-center">
                      {benefit.title}
                    </span>
                    <p className="text-white/90 text-center text-2xl">
                      {benefit.description}
                    </p>
                  </div>
                );
              }
              if (Math.abs(offset) === 1) {
                // Left/right faded cards
                return (
                  <div
                    key={benefit.id}
                    className="absolute left-1/2 -translate-x-1/2 z-0 bg-white/5 rounded-3xl p-10 shadow-xl flex flex-col items-center max-w-xl w-full transition-all scale-95 opacity-60"
                    style={{
                      transform: `translateX(${offset * 600}px) scale(0.95)`,
                      filter: "blur(0.5px)",
                    }}
                  >
                    <span className="text-3xl font-bold mb-3 text-white text-center">
                      {benefit.title}
                    </span>
                    <p className="text-white/70 text-center text-lg">
                      {benefit.description}
                    </p>
                  </div>
                );
              }
              if (Math.abs(offset) === 2) {
                // Further cards, barely visible
                return (
                  <div
                    key={benefit.id}
                    className="absolute left-1/2 -translate-x-1/2 z-0 bg-white/0 rounded-3xl p-8 flex flex-col items-center max-w-lg w-full transition-all scale-90 opacity-20"
                    style={{
                      transform: `translateX(${offset * 900}px) scale(0.9)`,
                      filter: "blur(1px)",
                    }}
                  >
                    <span className="text-2xl font-bold mb-2 text-white text-center">
                      {benefit.title}
                    </span>
                  </div>
                );
              }
              return null;
            })}
            {/* Next Button */}
            <button
              onClick={nextBenefit}
              disabled={activeBenefitIdx === benefits.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3 shadow-lg hover:bg-white/40 transition-all z-20"
              aria-label="Next"
            >
              <span className="text-2xl font-bold">
                <ChevronRight />
              </span>
            </button>
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
