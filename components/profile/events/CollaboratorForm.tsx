import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchProfiles } from "@/lib/profiles/fetchProfile";
import { useAuthStore } from "@/stores/authStore";
import { Label } from "@radix-ui/react-dropdown-menu";
import { X } from "lucide-react";
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
        const data = await searchProfiles<{
          id: string;
          first_name: string;
          account_type: string;
          avatar_url?: string;
        }>(debouncedQuery, {
          select: "id, first_name, account_type, avatar_url",
          filter: { account_type: "organisation" },
          excludeId: user.id,
          limit: 10,
        });

        // order by earliest match
        const sorted = data
          .sort((a, b) => {
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
    <div className="grid gap-2">
      <Label>Add Collaborators</Label>
      <Input
        id="collaborators"
        type="text"
        placeholder="DSCubed"
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
              <span>{result.name}</span>
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
            <div
              key={collaborator.id}
              className="flex items-center 
                max-w-48
                bg-white/[0.08] 
                border-white/20 shadow-xl 
                shadow-black/10  
                rounded-md 
                border gap-1 px-2 py-1"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
