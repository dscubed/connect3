import React from "react";
import Link from "next/link";

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  pathName?: string;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon: Icon,
  label,
  href,
  pathName,
}: SidebarLinkProps & { icon: React.ElementType }) => {
  const content = (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer select-none transition-all duration-200 ${
        pathName === href
          ? "bg-white/10 text-white shadow-lg shadow-white/5"
          : "text-white/80 hover:bg-white/5 hover:text-white hover:scale-105"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
