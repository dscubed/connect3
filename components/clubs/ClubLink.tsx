import { ExternalLink } from "lucide-react";
import React from "react";

interface ClubLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function ClubLink({ href, icon, label }: ClubLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-foreground hover:bg-foreground/60 border border-white/10 transition-all shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-white/90 font-medium text-sm sm:text-base">
          {label}
        </span>
      </div>
      <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
    </a>
  );
}
