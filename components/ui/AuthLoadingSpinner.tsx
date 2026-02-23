"use client";

/** Center-aligned purple spinner for auth-loading states. Use instead of blocking text UI. */
export default function AuthLoadingSpinner({
  fullPage = true,
}: {
  /** When true, uses min-h-[100dvh] for full-page blocking. When false, for use inside AuthShell/cards. */
  fullPage?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center ${fullPage ? "min-h-[100dvh]" : "min-h-[160px]"}`}
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600"
        aria-label="Loading"
      />
    </div>
  );
}
