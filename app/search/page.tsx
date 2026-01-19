"use client";
import { Suspense } from "react";
import SearchPageContent from "./SearchPageContent";
import { CubeLoader } from "@/components/ui/CubeLoader";

function SearchPageFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <CubeLoader />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
