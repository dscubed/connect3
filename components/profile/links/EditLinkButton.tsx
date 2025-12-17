import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";

export function EditLinkButton() {
  return (
    <Button className="px-2 py-1" variant={"ghost"}>
      <PencilLine className="!size-6" />
    </Button>
  );
}
