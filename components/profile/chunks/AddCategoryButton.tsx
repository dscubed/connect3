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

export function AddCategoryButton() {
  const { profile, loading } = useAuthStore.getState();
  const { orderedCategoryChunks, addCategory } = useChunkContext();

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

  if (categoriesList.length === 0) return null;

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
              <div className="flex gap-2 items-center align-center ">
                <h1 className="text-2xl font-semibold"> Add Category </h1>
              </div>
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
                  onClick={() => addCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
