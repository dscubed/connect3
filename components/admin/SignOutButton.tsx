export default function SignOutButton() {
  return (
    <form action="/api/admin/logout" method="POST">
      <button
        type="submit"
        className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
      >
        Sign out
      </button>
    </form>
  );
}
