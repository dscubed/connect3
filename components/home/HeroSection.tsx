import React from "react";
import Logo from "@/components/logo/Logo";

const HeroSection: React.FC = () => (
  <div className="flex flex-col sm:flex-row sm:gap-4 mt-12 text-center py-8">
    <Logo className="mx-auto mb-6 h-12 w-12 sm:h-16 sm:w-16 text-gray-100" />
    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
      connect3
    </h1>
  </div>
);

export default HeroSection;
