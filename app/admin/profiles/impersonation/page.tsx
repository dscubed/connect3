import { requireAdminSession } from "@/lib/admin/requireAdminSession";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminImpersonatePanel from "../../AdminImpersonatePanel";

export default async function AdminImpersonationPage() {
  const session = await requireAdminSession();

  return (
    <AdminPageLayout
      title="Impersonation"
      email={session.email}
      backHref="/admin"
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "Profiles" },
        { label: "Impersonation" },
      ]}
    >
      <AdminImpersonatePanel />
    </AdminPageLayout>
  );
}
