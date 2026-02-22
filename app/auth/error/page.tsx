import { AuthShell } from "@/components/auth/AuthShell";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell>
      <div className="w-full flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium tracking-tight text-black">
            Sorry, something went wrong.
          </h1>
          <p className="text-base text-black/50">
            {params?.error
              ? `Code error: ${params.error}`
              : "An unspecified error occurred."}
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
