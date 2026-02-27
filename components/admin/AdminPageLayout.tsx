import { ReactNode } from "react";
import AdminBreadcrumb from "./AdminBreadcrumb";
import SignOutButton from "./SignOutButton";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageLayoutProps {
  title: string;
  email: string;
  breadcrumb?: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  maxWidth?: string;
  children: ReactNode;
}

export default function AdminPageLayout({
  title,
  email,
  breadcrumb,
  backHref,
  backLabel = "← Dashboard",
  maxWidth = "max-w-2xl",
  children,
}: AdminPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`mx-auto ${maxWidth} px-4 py-8`}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            {breadcrumb && <AdminBreadcrumb items={breadcrumb} />}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-400">Signed in as {email}</p>
          </div>
          <div className="flex items-center gap-3">
            {backHref && (
              <a
                href={backHref}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {backLabel}
              </a>
            )}
            <SignOutButton />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
