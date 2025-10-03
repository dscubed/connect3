"use client";
import { Box } from "lucide-react";
import { useState, useEffect } from "react";
import { HeroSection } from "@/components/landing/hero/HeroSection";
import { UseCasesSection } from "@/components/landing/use-cases/UseCasesSection";
import { BenefitsSection } from "@/components/landing/benefits/BenefitsSection";

const sections = [
  { id: "home", label: "Home" },
  { id: "use-cases", label: "Use cases" },
  { id: "benefits", label: "Benefits" },
  { id: "collaborations", label: "Collaborations" }, // <-- fix spelling here
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("home");

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

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
            <span className="text-white/70 self-center hidden sm:inline text-sm md:text-base">
              Contact
            </span>
            <button className="px-4 md:px-5 py-2 rounded-full bg-white text-black font-medium hover:bg-white/90 transition text-sm md:text-base">
              Log in
            </button>
            <button className="px-4 md:px-5 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium hover:from-gray-600 hover:to-gray-500 transition text-sm md:text-base">
              Sign up
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <HeroSection />

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />

        {/* Use Cases Section - Responsive Card Layout */}
        <UseCasesSection />

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />

        {/* Benefits Section - Apple-style Draggable Carousel */}
        <BenefitsSection />

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
