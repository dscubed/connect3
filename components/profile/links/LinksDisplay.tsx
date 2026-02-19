import { Button } from "@/components/ui/button";
import { LinkItem, LinkTypes } from "./LinksUtils";
import Link from "next/link";
import { toast } from "sonner";

export function LinksDisplay({ links }: { links: LinkItem[] }) {
  return (
    <div className="flex gap-2">
      {links.map((link) => {
        const pattern = LinkTypes[link.type].pattern;
        const href = pattern ? pattern.prefix + link.details : undefined;

        return href ? (
          <Link
            key={link.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkButton link={link} />
          </Link>
        ) : (
          <LinkButton key={link.id} link={link} copy />
        );
      })}
    </div>
  );
}

function LinkButton({ link, copy }: { link: LinkItem; copy?: boolean }) {
  const LinkIcon = LinkTypes[link.type]?.icon;
  return (
    <Button
      key={link.id}
      variant="ghost"
      size="icon"
      className="px-2 py-1 text-muted"
      asChild
      onClick={() => {
        if (copy) {
          navigator.clipboard.writeText(link.details);
          toast.success("Details copied to clipboard!");
        }
      }}
    >
      <LinkIcon key={link.id} className="cursor-pointer" />
    </Button>
  );
}
