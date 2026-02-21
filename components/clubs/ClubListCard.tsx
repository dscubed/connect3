import { Club } from "@/types/clubs/club";
import ProfilePicture from "@/components/profile/ProfilePicture";

export function ClubListCard({
  club,
  isSelected,
  onClick,
}: {
  club: Club;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border transition-all duration-300 ${
        isSelected
          ? "bg-primary border-white/20"
          : "bg-[#f9f9f9] border-white/20 hover:bg-primary/80"
      }`}
    >
      <div
        className={`p-3 sm:p-5 flex items-start gap-3 sm:gap-4 ${
          isSelected ? "text-primary-foreground" : "text-secondary-foreground"
        }`}
      >
        {/* Logo */}
        <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 rounded-[10%]">
          <div className="scale-[0.31] sm:scale-[0.44] origin-center">
            <ProfilePicture
              avatar={club.avatar_url}
              userId={club.id}
              fullName={club.first_name}
              editingProfile={false}
              isOrganisation={true}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm sm:text-base mb-1 sm:mb-1.5 truncate ${
              isSelected
                ? "text-primary-foreground"
                : "text-secondary-foreground"
            }`}
          >
            {club.first_name}
          </h3>
          <p
            className={`text-opacity-50 text-xs sm:text-sm line-clamp-2 leading-relaxed ${
              isSelected
                ? "text-primary-foreground/50"
                : "text-secondary-foreground/50"
            }`}
          >
            {club.university || "No University Set"}
          </p>
        </div>
      </div>
    </div>
  );
}
