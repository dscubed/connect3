interface SidebarButtonProps {
  Icon?: React.ElementType;
  label?: string;
  active: boolean;
  isNew?: boolean;
}

export default function SidebarButton({
  Icon,
  label,
  isNew,
  active,
}: SidebarButtonProps) {
  return (
    <div
      className={`relative flex items-center gap-2 p-2 rounded-lg cursor-pointer select-none transition-all duration-200 hover:scale-105 w-fit ${
        active
          ? "bg-background text-foreground"
          : "text-muted hover:bg-black/5 hover:text-black"
      }`}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {label && (
        <span className="text-sm flex-1 min-w-0 truncate" title={label}>
          {label}
        </span>
      )}
      {isNew && (
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-foreground/70" />
      )}
    </div>
  );
}
