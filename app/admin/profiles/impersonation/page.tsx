import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin/session";
import AdminImpersonatePanel from "../../AdminImpersonatePanel";

export default async function AdminImpersonationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifyAdminToken(token) : null;

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <nav className="mb-1 flex items-center gap-1 text-xs text-gray-400">
              <a href="/admin" className="hover:text-gray-600 transition">
                Admin
              </a>
              <span>›</span>
              <span>Profiles</span>
              <span>›</span>
              <span className="text-gray-600">Impersonation</span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900">Impersonation</h1>
            <p className="text-sm text-gray-400">
              Signed in as {session.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              ← Dashboard
            </a>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <AdminImpersonatePanel />
      </div>
    </div>
  );
}
