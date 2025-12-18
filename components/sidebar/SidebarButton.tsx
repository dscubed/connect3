interface SidebarButtonProps {
  Icon?: React.ElementType;
  label: string;
  active: boolean;
}

export default function SidebarButton({
  Icon,
  label,
  active,
}: SidebarButtonProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer select-none transition-all duration-200 hover:scale-105 ${
        active
          ? "bg-background text-foreground shadow-lg shadow-black/5"
          : "text-black/80 hover:bg-black/5 hover:text-black"
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="text-sm">{label}</span>
    </div>
  );
}
