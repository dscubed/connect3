import { useAuthStore } from "@/stores/authStore";
import {
  OrganisationCategories,
  organisationCategoriesList,
  UserCategories,
  userCategoriesList,
} from "./ChunkUtils";
import { useChunkContext } from "./hooks/ChunkProvider";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionCard, SectionCardHeader } from "../SectionCard";
import { CardContent } from "@/components/ui/card";

export function AddCategoryButton() {
  const { profile, loading } = useAuthStore.getState();
  const { orderedCategoryChunks } = useChunkContext();
  const [showSelector, setShowSelector] = useState(false);

  let categoriesList: UserCategories[] | OrganisationCategories[] = [];
  if (profile?.account_type === "user") {
    categoriesList = userCategoriesList.filter(
      (category) =>
        !orderedCategoryChunks.find((cat) => cat.category === category)
    );
  } else if (profile?.account_type === "organisation") {
    categoriesList = organisationCategoriesList.filter(
      (category) =>
        category !== "Events" &&
        !orderedCategoryChunks.find((cat) => cat.category === category)
    );
  }

  if (categoriesList.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-start gap-2 mb-12">
      {!profile || loading ? (
        <Spinner className="h-4 w-4" />
      ) : !showSelector ? (
        <Button
          variant={"ghost"}
          onClick={() => setShowSelector(true)}
          className="flex w-full justify-center border border-rounded-xl !text-card-foreground !bg-transparent h-fit py-3 
          opacity-50 hover:opacity-100 transition-opacity transition-duration-300 animate-fade-in"
        >
          <Plus className="!size-4" />
        </Button>
      ) : (
        <SectionCard variant="white">
          <SectionCardHeader
            title={
              <CategorySelector
                categoriesList={categoriesList}
                setShowSelector={setShowSelector}
              />
            }
          ></SectionCardHeader>

          <CardContent className="w-full">
            <p className="text-lg text-muted/80 pointer-events-none select-none">
              Select a category first to start adding chunks
            </p>
            <div className="flex w-full justify-end mt-4">
              <Button
                variant="ghost"
                className="!bg-transparent text-muted hover:text-card-foreground"
                onClick={() => setShowSelector(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </SectionCard>
      )}
    </div>
  );
}

const CategorySelector = ({
  categoriesList,
  setShowSelector,
}: {
  categoriesList: UserCategories[] | OrganisationCategories[];
  setShowSelector: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { addCategory } = useChunkContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="rounded-md px-2 py-1 cursor-pointer transition-all focus-visible:ring-0 focus-visible::outline-none"
      >
        <Button variant="ghost" className="!p-0 !bg-transparent h-fit">
          <h1 className="text-base font-medium !text-card-foreground">
            Select Category
          </h1>
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
              onClick={() => {
                addCategory(category);
                setShowSelector(false);
              }}
            >
              {category}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
