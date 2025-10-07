import { useState } from "react";
import LogoAnimated from "@/components/logo/LogoAnimated";
import Link from "next/link";

export default function SidebarHeader() {
  const [headerHovering, setHeaderHovering] = useState(false);

  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer"
      onMouseEnter={() => setHeaderHovering(true)}
      onMouseLeave={() => setHeaderHovering(false)}
    >
      <LogoAnimated
        width={20}
        height={20}
        fill={"white"}
        onHover={true}
        hovering={headerHovering}
      />
      <span className="font-semibold tracking-tight">connect3</span>
    </Link>
  );
}
