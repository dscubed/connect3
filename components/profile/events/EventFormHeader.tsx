import { ExternalLink } from "lucide-react";

const TICKETING_URL =
  process.env.NEXT_PUBLIC_TICKETING_URL ?? "https://tix.connect3.app";

export default function EventFormHeader({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const href = `${TICKETING_URL}/dashboard/events`;

  if (variant === "compact") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full border border-muted/40 px-2 py-1 text-sm font-medium text-muted transition-colors hover:text-card-foreground"
      >
        Manage Events
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full items-center justify-between rounded-lg py-2 transition-all hover:bg-white/5"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-semibold">Manage Events</h3>
        <ExternalLink className="h-4 w-4 text-muted/70 transition-colors group-hover:text-muted" />
      </div>
    </a>
  );
}
