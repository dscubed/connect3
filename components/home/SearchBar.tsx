import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { universities } from "@/components/profile/details/univeristies";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SearchBarUI } from "./SearchBarUI";
import { useInstantSearch } from "@/hooks/useInstantSearch";
import { InstantSearchDropdown } from "./InstantSearchDropdown";

const ALL_UNIVERSITIES = Object.keys(universities).filter(
  (key) => key !== "others",
);
const STORAGE_KEY = "uni-preferences";

const allSuggestions = [
  "Find clubs related to AI and machine learning",
  "Show me upcoming networking events",
  "Find students interested in web development",
  "What events are happening on campus this week?",
  "Find people who play basketball",
  "Show me music and arts societies",
  "Find students looking for project partners",
  "Show me entrepreneurship and startup clubs",
  "Find photography or film clubs",
  "What social events are coming up this month?",
  "Show me debate or public speaking clubs",
  "Find students interested in data science",
  "Are there any clubs for creative writing?",
  "Find people studying computer science",
  "Show me sports and fitness clubs",
  "Find clubs focused on sustainability",
  "What engineering clubs are on campus?",
  "Find people interested in design and UX",
  "Show me cultural and language clubs",
  "Find clubs for board games or tabletop gaming",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface SearchBarProps {
  containerClassName?: string;
}

export function SearchBar({ containerClassName }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [rawQuery, setRawQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    () => [],
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSelectedUniversities(parsed);
      } else {
        setSelectedUniversities(ALL_UNIVERSITIES);
      }
    } catch {
      setSelectedUniversities(ALL_UNIVERSITIES);
    }
  }, []);

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSuggestions(pickRandom(allSuggestions, 5));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUniversities));
  }, [selectedUniversities]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { results, isLoading } = useInstantSearch(rawQuery);

  const showDropdown = dropdownOpen && rawQuery.trim().length >= 2;

  const handleUniversityChange = useCallback((uni: string) => {
    if (uni == "all") {
      setSelectedUniversities(ALL_UNIVERSITIES);
      return;
    }

    setSelectedUniversities((prev) =>
      prev.includes(uni) ? prev.filter((u) => u !== uni) : [...prev, uni],
    );
  }, []);

  const handleUniversityClear = useCallback(() => {
    setSelectedUniversities([]);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query.");
      return;
    }

    setDropdownOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleRawQueryChange = useCallback((q: string) => {
    setRawQuery(q);
    setDropdownOpen(true);
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full">
      {suggestions.length > 0 && (
        <Suggestions className="mx-auto max-w-3xl">
          {suggestions.map((s) => (
            <Suggestion key={s} suggestion={s} onClick={handleSearch} />
          ))}
        </Suggestions>
      )}

      <div ref={containerRef} className="relative mx-auto w-full max-w-3xl">
        <SearchBarUI
          query={query}
          setQuery={setQuery}
          disabled={false}
          onSubmit={handleSearch}
          containerClassName={containerClassName}
          selectedUniversities={selectedUniversities}
          onUniversityChange={handleUniversityChange}
          onUniversityClear={handleUniversityClear}
          onRawQueryChange={handleRawQueryChange}
        />
        {showDropdown && (
          <InstantSearchDropdown
            query={rawQuery}
            results={results}
            isLoading={isLoading}
            onDismiss={() => setDropdownOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
