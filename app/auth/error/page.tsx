import { AuthShell } from "@/components/auth/AuthShell";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell>
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-black">
            Sorry, something went wrong.
          </h1>
          <p className="text-sm text-black/70">
            {params?.error
              ? `Code error: ${params.error}`
              : "An unspecified error occurred."}
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
