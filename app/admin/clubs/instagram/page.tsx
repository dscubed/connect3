import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin/session";
import InstagramQueuePanel from "./InstagramQueuePanel";

export default async function AdminInstagramPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifyAdminToken(token) : null;

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Instagram Fetch Table
            </h1>
            <p className="text-sm text-gray-400">
              Signed in as {session.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              ← Back
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

        <InstagramQueuePanel />
      </div>
    </div>
  );
}
