import type { ExtractedLink } from "@/lib/search/general/extractLinks";

export function QuickLinks({ links }: { links: ExtractedLink[] }) {
  if (!links.length) return null;

  return (
    <div className="rounded-2xl border p-3">
      <div className="text-xs font-medium uppercase tracking-wide opacity-70 mb-2">
        Quick links
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-offset-2"
            title={l.url}
          >
            {l.label}
            <span aria-hidden>↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
