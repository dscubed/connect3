"use client";
import { useState, useEffect } from "react";
import { LandingHero } from "@/components/landing/hero/LandingHero";
import { LandingHeroGlow } from "@/components/landing/hero/LandingHeroGlow";
import { BenefitsSection } from "@/components/landing/benefits/BenefitsSection";
import { CollaborationsSection } from "@/components/landing/collaborations/CollaborationsSection";
import Link from "next/link";
import LandingSidebar from "@/components/landing/Sidebar/LandingSidebar";
import LogoAnimated from "@/components/logo/LogoAnimated";

const sections = [
  { id: "home", label: "Home" },
  { id: "collaborations", label: "Collaborations" },
  { id: "use-cases", label: "Use cases" },
  { id: "benefits", label: "Benefits" },
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("home");
  const [sectionClicked, setSectionClicked] = useState<string | null>(null);

  const handleNavClick = (id: string) => {
    setSectionClicked(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeSection === sectionClicked) {
      setSectionClicked(null);
    }
  }, [activeSection, sectionClicked]);

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
      <LandingSidebar
        activeSection={activeSection}
        sections={sections}
        handleNavClick={handleNavClick}
        sectionClicked={sectionClicked}
      />

      {/* Mobile Logo - Shown only on mobile */}
      <Link href="/">
        <div className="lg:hidden fixed top-4 left-4 z-30 flex items-center gap-2">
          <LogoAnimated width={32} height={32} fill={"white"} delay={2} />
          <span className="hidden xs:block text-base font-extrabold text-white">
            connect3
          </span>
        </div>
      </Link>

      {/* Main Content - Offset by sidebar width on desktop */}
      <main className="lg:ml-64 flex flex-col items-center bg-[#0B0B0C]">
        {/* Fixed Header - Floats over content but stays at top */}
        <header className="fixed top-0 left-0 right-0 lg:left-64 flex justify-end items-center bg-black/10 backdrop-blur-md border-b border-white/10 z-20 py-4 px-6 md:px-8">
          <div className="flex gap-3 md:gap-4 justify-center items-center">
            <Link href="mailto:president@dscubed.org.au?subject=Student Club Join Request | Connect3&body=Hi there!%0D%0A%0D%0A Our club: {club name} is interested in joining Connect3.%0D%0A%0D%0A Here is our club email address: {club email address}.">
              <span className="hidden xs:block text-white/70 self-center text-sm md:text-base hover:text-white transition-colors">
                Contact
              </span>
            </Link>
            <Link href="/auth/login">
              <button className="px-4 md:px-5 py-1.5 text-sm rounded-lg border border-white/20 hover:border-white/30 hover:bg-white/5 transition-all hover:scale-105 text-white font-medium">
                log in
              </button>
            </Link>
            <Link href="/auth/sign-up">
              <button className="px-4 md:px-5 py-1.5 text-sm rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-md">
                sign up
              </button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <LandingHero />
        <LandingHeroGlow />

        {/* Collaborations Section */}
        <CollaborationsSection />

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />

        {/* Use Cases Section - Responsive Card Layout */}
        {/* Temporarily removed due to new Search structure */}
        {/* <UseCasesSection /> */}

        <div className="w-full border-t border-white/10 my-12 shadow-[0_0_32px_0px_rgba(255,255,255,0.25)]" />

        {/* Benefits Section - Apple-style Draggable Carousel */}
        <BenefitsSection />
      </main>
    </div>
  );
}
