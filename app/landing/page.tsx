"use client";
import { useState, useEffect } from "react";
import { HeroSection } from "@/components/landing/hero/HeroSection";
import { UseCasesSection } from "@/components/landing/use-cases/UseCasesSection";
import { BenefitsSection } from "@/components/landing/benefits/BenefitsSection";
import { CollaborationsSection } from "@/components/landing/collaborations/CollaborationsSection";
import { SharedSidebar } from "@/components/shared/SharedSidebar";
import { AuthButton } from "@/components/auth/auth-button";
import AnimatedParticles from "@/components/AnimatedParticles";

const sections = [
  { id: "home", label: "Overview" },
  { id: "collaborations", label: "Partners" },
  { id: "use-cases", label: "Demo" },
  { id: "benefits", label: "Features" },
];

export default function LandingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const sidebarSections = sections.map((section) => ({
    ...section,
    onClick: () => handleNavClick(section.id),
  }));

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // More sensitive detection area
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all sections
    const sections = ['home', 'collaborations', 'use-cases', 'benefits'];
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      {/* Shared Sidebar */}
      <SharedSidebar
        sections={sidebarSections}
        activeSection={activeSection}
        isLandingPage={true}
      />

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 relative">
        {/* Compact Top-right auth panel (match Home) */}
        <div className="fixed top-0 right-0 z-40 p-4 safe-area-inset-top">
          <div className="flex justify-end">
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-2">
              <AuthButton />
            </div>
          </div>
        </div>

        <div
          className="flex flex-col h-screen overflow-y-auto overflow-x-hidden w-full scroll-smooth"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.3) transparent" }}
        >
          <AnimatedParticles />

          {/* Hero Section - centered like Home */}
          <div id="home" className="flex-shrink-0 flex flex-col items-center justify-center w-full h-screen">
            <HeroSection />
          </div>

          {/* Content Sections - each taking significant screen space */}
          <div className="flex-shrink-0 w-full">
            {/* Collaborations Section */}
            <div id="collaborations" className="min-h-screen flex items-center justify-center py-16">
              <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 w-full">
                <CollaborationsSection />
              </div>
            </div>

            {/* Use Cases Section */}
            <div id="use-cases" className="min-h-screen flex items-center justify-center py-16">
              <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 w-full">
                <UseCasesSection />
              </div>
            </div>

            {/* Benefits Section */}
            <div id="benefits" className="min-h-screen flex items-center justify-center py-16">
              <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 w-full">
                <BenefitsSection />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
