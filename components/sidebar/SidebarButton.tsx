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
          ? "bg-white/10 text-white shadow-lg shadow-white/5"
          : "text-white/80 hover:bg-white/5 hover:text-white"
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="text-sm">{label}</span>
    </div>
  );
}
