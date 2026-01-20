import { useState } from "react";
import LogoAnimated from "@/components/logo/LogoAnimated";
import Link from "next/link";
import { Sidebar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SidebarHeader({
  chatroomsOpen,
  setChatroomsOpen,
}: {
  chatroomsOpen: boolean;
  setChatroomsOpen: (open: boolean) => void;
}) {
  const [headerHovering, setHeaderHovering] = useState(false);

  return (
    <div
      className={cn(
        "flex justify-center cursor-pointer w-fit p-1.5 rounded-xl",
        "hover:scale-105 transition-all duration-200",
        !chatroomsOpen && "text-muted hover:text-black hover:bg-muted/15"
      )}
    >
      {chatroomsOpen ? (
        <Link
          href="/"
          onMouseEnter={() => setHeaderHovering(true)}
          onMouseLeave={() => setHeaderHovering(false)}
        >
          <LogoAnimated
            width={20}
            height={20}
            onHover={true}
            hovering={headerHovering}
          />
        </Link>
      ) : (
        <Sidebar className="h-5 w-5" onClick={() => setChatroomsOpen(true)} />
      )}
    </div>
  );
}
