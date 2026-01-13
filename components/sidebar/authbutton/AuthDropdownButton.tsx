import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function AuthDropdownButton({
  onClick,
  text,
  icon,
}: {
  onClick: () => void;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
    >
      {icon}

      <span className="text-sm font-medium">{text}</span>
    </DropdownMenuItem>
  );
}
