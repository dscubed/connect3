import { requireAdminSession } from "@/lib/admin/requireAdminSession";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import InstagramQueuePanel from "./InstagramQueuePanel";

export default async function AdminInstagramPage() {
  const session = await requireAdminSession();

  return (
    <AdminPageLayout
      title="Instagram Fetch Table"
      email={session.email}
      maxWidth="max-w-5xl"
      backHref="/admin"
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "Clubs" },
        { label: "Instagram" },
      ]}
    >
      <InstagramQueuePanel />
    </AdminPageLayout>
  );
}
