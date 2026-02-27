import { requireAdminSession } from "@/lib/admin/requireAdminSession";
import AdminPageLayout from "@/components/admin/AdminPageLayout";

export default async function AdminPage() {
  const session = await requireAdminSession();

  return (
    <AdminPageLayout title="Admin Dashboard" email={session.email}>
      <div className="space-y-8">
        {/* Clubs */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Clubs
          </h2>
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <a
              href="/admin/clubs"
              className="flex items-center justify-between px-5 py-4 transition hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Handover</p>
                <p className="text-xs text-gray-400">Manage club handover</p>
              </div>
              <span className="text-gray-300">›</span>
            </a>
            <a
              href="/admin/clubs/instagram"
              className="flex items-center justify-between px-5 py-4 transition hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Instagram</p>
                <p className="text-xs text-gray-400">Instagram fetch table</p>
              </div>
              <span className="text-gray-300">›</span>
            </a>
          </div>
        </section>

        {/* Profiles */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Profiles
          </h2>
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <a
              href="/admin/profiles/impersonation"
              className="flex items-center justify-between px-5 py-4 transition hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Impersonation
                </p>
                <p className="text-xs text-gray-400">
                  Generate magic links to sign in as any user
                </p>
              </div>
              <span className="text-gray-300">›</span>
            </a>
          </div>
        </section>
      </div>
    </AdminPageLayout>
  );
}
