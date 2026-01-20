import React from "react";
import Logo from "@/components/logo/Logo";
import { HeroPanels } from "./HeroPanels";

const HeroSection: React.FC = () => (
  <div className="flex flex-col w-full">
    <div className="flex flex-row gap-2 mt-6 mb-2 py-8 justify-center items-center">
      <Logo className="h-12 w-12 sm:h-14 sm:w-14" />
      <h1 className="text-4xl font-extrabold tracking-tight leading-[1.1]">
        Connect3
      </h1>
    </div>
    <HeroPanels />
  </div>
);

export default HeroSection;
