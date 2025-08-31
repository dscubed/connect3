"use client";

export default function LoadingIndicator({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300 mb-4" />
      <span className="text-gray-400">{message}</span>
    </div>
  );
}
