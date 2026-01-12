interface SidebarButtonProps {
  Icon?: React.ElementType;
  label?: string;
  active: boolean;
}

export default function SidebarButton({
  Icon,
  label,
  active,
}: SidebarButtonProps) {
  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer select-none transition-all duration-200 hover:scale-105 w-fit ${
        active
          ? "bg-background text-foreground shadow-lg shadow-black/5"
          : "text-muted hover:bg-black/5 hover:text-black"
      }`}
    >
      {Icon && <Icon className="h-6 w-6" />}
      {label && (
        <span className="text-sm flex-1 min-w-0 truncate" title={label}>
          {label}
        </span>
      )}
    </div>
  );
}
