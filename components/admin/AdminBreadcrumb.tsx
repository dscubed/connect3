interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function AdminBreadcrumb({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  return (
    <nav className="mb-1 flex items-center gap-1 text-xs text-gray-400">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1">
          {i > 0 && <span>›</span>}
          {item.href ? (
            <a href={item.href} className="transition hover:text-gray-600">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-600">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
