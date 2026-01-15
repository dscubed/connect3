import { useEffect, useState } from "react";

/**
 * Custom hook for breakpoint conditional rendering
 * instead of using Tailwind breakpoints
 * Sourced from https://usehooks-ts.com/react-hook/use-media-query
 * @param query eg "(min-width: 64rem)"
 * @returns
 */
export function useMediaQuery(query: string) {
  // Always start with false to avoid hydration mismatch
  // The real value will be set in useEffect after hydration
  const [matchesQuery, setMatchesQuery] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set the initial value after mount
    setMatchesQuery(media.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatchesQuery(e.matches);
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matchesQuery;
}

export const useBreakpointSmall = () => useMediaQuery("(min-width: 40rem)");
export const useBreakpointMedium = () => useMediaQuery("(min-width: 48rem)");
export const useBreakpointLarge = () => useMediaQuery("(min-width: 64rem)");
export const useBreakpointLargeX = () => useMediaQuery("(min-width: 80rem)");
export const useBreakpointLargeXX = () => useMediaQuery("(min-width: 96rem)");
