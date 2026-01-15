import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { X } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface CollaboratorFormProps {
  collaborators: { id: string; name: string }[];
  setCollaborators: Dispatch<SetStateAction<{ id: string; name: string }[]>>;
  disabled?: boolean;
}

export default function CollaboratorForm({
  collaborators,
  setCollaborators,
  disabled = false,
}: CollaboratorFormProps) {
  const DEBOUNCE_TIMEOUT = 300;
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; avatar_url?: string }>
  >([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, DEBOUNCE_TIMEOUT);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search for collaborators
  useEffect(() => {
    if (!user) return;

    const searchCollaborators = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, account_type, avatar_url")
          .ilike("first_name", `%${debouncedQuery}%`)
          .eq("account_type", "organisation")
          .neq("id", user.id) // exclude current user
          .limit(10);

        if (error) {
          console.error("Error searching profiles:", error);
          setSearchResults([]);
        } else {
          // order by earliest match
          const sorted = data
            ?.sort((a, b) => {
              const aStarts = a.first_name
                .toLowerCase()
                .startsWith(debouncedQuery.toLowerCase());
              const bStarts = b.first_name
                .toLowerCase()
                .startsWith(debouncedQuery.toLowerCase());
              if (aStarts && !bStarts) return -1;
              if (!aStarts && bStarts) return 1;
              return 0;
            })
            .slice(0, 10);

          const results = sorted.map((profile) => ({
            id: profile.id,
            name: `${profile.first_name}`.trim(),
            avatar_url: profile.avatar_url,
          }));
          setSearchResults(results);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    searchCollaborators();
  }, [debouncedQuery, user]);

  const addCollaborator = (collaborator: { id: string; name: string }) => {
    if (!collaborators.find((c) => c.id === collaborator.id) && !disabled) {
      setCollaborators([...collaborators, collaborator]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeCollaborator = (id: string) => {
    if (disabled) return;
    setCollaborators(collaborators.filter((c) => c.id !== id));
  };

  return (
    <div className="grid gap-4">
      <Input
        id="collaborators"
        type="text"
        placeholder="Add Collaborators"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={disabled}
      />
      {searchLoading && (
        <div className="text-sm text-gray-500">Searching...</div>
      )}
      {searchResults.length > 0 && (
        <div className="border rounded p-2 max-h-40 overflow-y-auto">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="flex items-center justify-between p-2 hover:bg-white/5 select-none"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
                <Image
                  src={result.avatar_url || "/placeholder.png"}
                  alt={`${result.name} logo`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover drop-shadow-md"
                  crossOrigin="anonymous"
                />
              </div>
              <span className="truncate px-4">{result.name}</span>
              <Button
                size="sm"
                onClick={() => addCollaborator(result)}
                disabled={
                  disabled || collaborators.some((c) => c.id === result.id)
                }
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      )}

      {collaborators.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {collaborators.map((collaborator) => (
            <Badge
              key={collaborator.id}
              variant="secondary"
              className="flex items-center max-w-48 rounded-md border gap-1 px-2 py-1 font-normal"
            >
              <span className="text-sm truncate">{collaborator.name}</span>
              <button
                type="button"
                onClick={() => removeCollaborator(collaborator.id)}
                className="text-red-500 hover:text-red-70 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
