import Link from "next/link";
import { FaGlobe } from "react-icons/fa";
import { Globe } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { SectionCard, SectionCardHeader } from "./SectionCard";
import { LinkTypes } from "./links/LinksUtils";
import { useProfileEditContext } from "./hooks/ProfileEditProvider";
import { ProfileDetail } from "./ProfileProvider";

interface ClubLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function ClubLinksCard({ profile }: { profile: ProfileDetail }) {
  const { draft } = useProfileEditContext();
  const links: ClubLink[] = [];

  const activeLinks = draft?.links ?? profile.links ?? [];

  const websiteLink = activeLinks.find((l) => l.type === "website");
  if (websiteLink) {
    links.push({
      label: "Official Website",
      href: websiteLink.details,
      icon: <FaGlobe className="text-muted shrink-0" />,
    });
  }

  const umsuLink = activeLinks.find((l) => l.type === "umsu");
  if (umsuLink) {
    const umsuPrefix = LinkTypes["umsu"].pattern!.prefix;
    links.push({
      label: "Student Union",
      href: umsuPrefix + umsuLink.details,
      icon: <Globe className="w-4 h-4 shrink-0" />,
    });
  }

  if (links.length === 0) return null;

  return (
    <SectionCard className="mb-4" variant="white">
      <SectionCardHeader title="Links" />
      <CardContent className="w-full flex flex-col !p-4 !pt-0">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-2.5 hover:bg-muted/10 rounded-md px-2 -mx-2 transition-colors"
          >
            {link.icon}
            <span className="text-base">{link.label}</span>
          </Link>
        ))}
      </CardContent>
    </SectionCard>
  );
}
