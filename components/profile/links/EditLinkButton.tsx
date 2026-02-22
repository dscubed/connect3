import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function EditLinkButton({ onClick }: { onClick: () => void }) {
  return (
    <Button className="size-9 p-0 bg-muted/15 hover:bg-muted/25 text-muted hover:text-current" variant="ghost" onClick={onClick}>
      <Plus className="!size-5" />
    </Button>
  );
}
