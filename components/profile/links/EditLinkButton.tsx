import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function EditLinkButton({ onClick }: { onClick: () => void }) {
  return (
    <Button className="px-2 py-1" variant="ghost" onClick={onClick}>
      <PlusCircle className="!size-6" />
    </Button>
  );
}
