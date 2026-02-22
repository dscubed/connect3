"use client";
import { Suspense } from "react";
import SearchPageContent from "./SearchPageContent";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { CharacterBackground } from "@/components/ui/CharacterBackground";

function SearchPageFallback() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-gray-50">
      <CubeLoader />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <CharacterBackground />
      <SearchPageContent />
    </Suspense>
  );
}
