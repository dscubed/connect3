"use client";
import { Box } from "lucide-react";
import { useState, useEffect } from "react";
import { HeroSection } from "@/components/landing/hero/HeroSection";
import { UseCasesSection } from "@/components/landing/use-cases/UseCasesSection";
import { BenefitsSection } from "@/components/landing/benefits/BenefitsSection";
import { CollaborationsSection } from "@/components/landing/collaborations/CollaborationsSection";
import Link from "next/link";

const sections = [
  { id: "home", label: "Home" },
  { id: "collaborations", label: "Collaborations" },
  { id: "use-cases", label: "Use cases" },
  { id: "benefits", label: "Benefits" },
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("home");

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 2;

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
    <div className="min-h-screen bg-black text-white">
      {/* Sticky Sidebar - Hidden on Mobile */}
      <aside className="hidden lg:flex fixed left-0 top-0 w-64 bg-black border-r-2 border-white/10 flex-col items-center py-8 h-screen z-30">
        <Link href="/">
          <div className="flex flex-row items-center justify-center mb-8 hover:scale-105 transition-transform duration-200 cursor-pointer">
            <Box className="h-10 w-10 text-white/80" />
            <span className="ml-2 text-lg font-extrabold">connect3</span>
          </div>
        </Link>
        <div className="flex-1" />
        <nav className="flex flex-col gap-2 w-full px-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`text-left px-2 py-1 rounded transition-all ${
                activeSection === section.id
                  ? "bg-white/10 text-white font-bold"
                  : "text-white/60 hover:text-white hover:scale-105 duration-200"
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
        <span className="hidden xs:block text-base font-extrabold text-white">
          connect3
        </span>
      </div>

      {/* Main Content - Offset by sidebar width on desktop */}
      <main className="lg:ml-64 flex flex-col items-center">
        {/* Fixed Header - Floats over content but stays at top */}
        <header className="fixed top-0 left-0 right-0 lg:left-64 flex justify-end items-center bg-black/20 backdrop-blur-md border-b border-white/10 z-20 py-4 px-6 md:px-8">
          <div className="flex gap-3 md:gap-4 justify-center items-center">
            <Link href="mailto:president@dscubed.org.au?subject=Student Club Join Request | Connect3&body=Hi there!%0D%0A%0D%0A Our club: {club name} is interested in joining Connect3.%0D%0A%0D%0A Here is our club email address: {club email address}.">
              <span className="hidden xs:block text-white/70 self-center text-sm md:text-base">
                Contact
              </span>
            </Link>
            <Link href="/auth/login">
              <button className="px-4 md:px-5 py-2 rounded-full bg-white text-black font-medium hover:bg-white/90 transition text-sm md:text-base">
                Log in
              </button>
            </Link>
            <Link href="/auth/sign-up">
              <button className="px-4 md:px-5 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium hover:from-gray-600 hover:to-gray-500 transition text-sm md:text-base">
                Sign up
              </button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <HeroSection />

        {/* Glowy gradient transition - GitHub style */}
        <div className="w-full relative pb-6">
          {/* Main gradient line */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          {/* Glow effects - positioned to emanate from the line */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-6 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm" />
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-12 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md" />
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-16 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-lg" />
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-xl" />
        </div>

        {/* Collaborations Section */}
        <CollaborationsSection />

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />

        {/* Use Cases Section - Responsive Card Layout */}
        <UseCasesSection />

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />

        {/* Benefits Section - Apple-style Draggable Carousel */}
        <BenefitsSection />
      </main>
    </div>
  );
}
