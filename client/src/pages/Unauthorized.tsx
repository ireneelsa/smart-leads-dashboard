import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Unauthorized() {
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        {user
          ? `Your role (${user.role}) does not have permission to view this page.`
          : "You do not have permission to view this page."}
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/dashboard"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go to dashboard
        </Link>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
