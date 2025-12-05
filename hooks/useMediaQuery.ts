import { useEffect, useState } from "react";

const IS_SERVER = typeof window === 'undefined'

/**
 * Custom hook for breakpoint conditional rendering
 * instead of using Tailwind breakpoints
 * Sourced from https://usehooks-ts.com/react-hook/use-media-query
 * @param query eg "(width <= 600px)"
 * @returns 
 */
export function useMediaQuery(query: string) {
  const isQueryMatch = (query: string): boolean => {
    if (IS_SERVER) {
      return false;
    }
    return window.matchMedia(query).matches
  }
  const [matchesQuery, setMatchesQuery] = useState(isQueryMatch(query));
  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matchesQuery) {
      setMatchesQuery(media.matches);
    }

    const handleChange = () => {
      setMatchesQuery(isQueryMatch(query))
    }

    media.addEventListener("change", handleChange);
    

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [matchesQuery, query]);

  return matchesQuery;
}

export const breakpointSmall = () => useMediaQuery("(min-width: 40rem)");
export const breakpointMedium = () => useMediaQuery("(min-width: 48rem)");
export const breakpointLarge = () => useMediaQuery("(min-width: 64rem)");
export const breakpointLargeX = () => useMediaQuery("(min-width: 80rem)");
export const breakpointLargeXX = () => useMediaQuery("(min-width: 96rem)");