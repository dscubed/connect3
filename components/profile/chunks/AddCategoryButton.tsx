import { useAuthStore } from "@/stores/authStore";
import {
  AllCategories,
  ChunkInput,
  OrganisationCategories,
  organisationCategoriesList,
  UserCategories,
  userCategoriesList,
} from "./ChunkUtils";
import { useState } from "react";
import { useChunkContext } from "./hooks/ChunkProvider";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChunkEditor } from "./display/ChunkEditor";
import { Fade } from "@/components/ui/Fade";
import { Button } from "@/components/ui/button";

export function AddCategoryButton() {
  const { profile, loading } = useAuthStore.getState();
  const [selectedCategory, setSelectedCategory] =
    useState<AllCategories | null>(null);
  const { orderedCategoryChunks } = useChunkContext();
  const [chunk, setChunk] = useState<ChunkInput>({ text: "", category: null });

  let categoriesList: UserCategories[] | OrganisationCategories[] = [];
  if (profile?.account_type === "user") {
    categoriesList = userCategoriesList.filter(
      (category) =>
        !orderedCategoryChunks.find((cat) => cat.category === category)
    );
  } else if (profile?.account_type === "organisation") {
    categoriesList = organisationCategoriesList.filter(
      (category) =>
        !orderedCategoryChunks.find((cat) => cat.category === category)
    );
  }

  return (
    <div className="w-full flex flex-col items-start gap-2 mb-12">
      {!profile || loading ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="rounded-md px-2 py-1 cursor-pointer transition-all focus-visible:ring-0 focus-visible::outline-none"
          >
            <Button variant="ghost">
              {selectedCategory ? (
                <h1 className="text-2xl font-semibold">{selectedCategory}</h1>
              ) : (
                <div className="flex gap-2 items-center align-center ">
                  <h1 className="text-2xl font-semibold"> Add Category </h1>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={12}
            className="max-h-48 overflow-scroll scrollbar-hide"
          >
            {categoriesList.length === 0 ? (
              <DropdownMenuItem disabled>No categories left</DropdownMenuItem>
            ) : (
              categoriesList.map((category) => (
                <DropdownMenuItem
                  className="text-base"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Fade show={!!selectedCategory} className="w-full">
        <ChunkEditor
          chunk={{ ...chunk, category: selectedCategory }}
          setChunk={setChunk}
          cancel={() => setSelectedCategory(null)}
        />
      </Fade>
    </div>
  );
}
