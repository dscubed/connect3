import { requireAdminSession } from "@/lib/admin/requireAdminSession";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import ClubHandoverPanel from "./ClubHandoverPanel";

export default async function AdminClubsPage() {
  const session = await requireAdminSession();

  return (
    <AdminPageLayout
      title="Club Handover"
      email={session.email}
      maxWidth="max-w-4xl"
      backHref="/admin"
      breadcrumb={[
        { label: "Admin", href: "/admin" },
        { label: "Clubs" },
        { label: "Handover" },
      ]}
    >
      <ClubHandoverPanel />
    </AdminPageLayout>
  );
}
