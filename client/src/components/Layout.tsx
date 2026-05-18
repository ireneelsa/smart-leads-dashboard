import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-indigo-600 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
  }`;

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/dashboard" className="text-lg font-semibold text-slate-900 dark:text-white">
            Smart Leads
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
