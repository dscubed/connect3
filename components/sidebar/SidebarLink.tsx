import React from "react";
import Link from "next/link";
import SidebarButton from "./SidebarButton";

interface SidebarLinkProps {
  icon?: React.ElementType;
  label?: string;
  href?: string;
  pathName?: string;
  isNew?: boolean;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon: Icon,
  label,
  href,
  pathName,
  isNew,
}: SidebarLinkProps) => {
  const content = (
    <SidebarButton
      Icon={Icon}
      label={label}
      active={href === pathName}
      isNew={isNew}
    />
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
