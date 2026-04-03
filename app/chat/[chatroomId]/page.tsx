"use client";
import { Suspense } from "react";
import { CubeLoader } from "@/components/ui/CubeLoader";
import ChatPageContent from "./ChatPageContent";

function ChatPageFallback() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-gray-50">
      <CubeLoader />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatPageFallback />}>
      <ChatPageContent />
    </Suspense>
  );
}
