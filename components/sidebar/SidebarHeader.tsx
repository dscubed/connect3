import { useState } from "react";
import LogoAnimated from "@/components/logo/LogoAnimated";
import Link from "next/link";

export default function SidebarHeader() {
  const [headerHovering, setHeaderHovering] = useState(false);

  return (
    <Link
      href="/"
      className="flex justify-center cursor-pointer w-fit p-1.5 rounded-xl hover:scale-105 transition-all duration-200 text-muted hover:text-black hover:bg-muted/15"
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
  );
}
