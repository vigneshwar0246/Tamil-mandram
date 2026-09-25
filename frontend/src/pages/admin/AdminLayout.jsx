import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/ui";

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  if (!user || !isAdmin) {
    return (
      <div className="container-tamil flex min-h-[70vh] flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="text-5xl">🔒</div>
        <h1 className="font-display text-3xl font-bold">Admin Portal Access Required</h1>
        <p className="max-w-md text-sm opacity-70">
          You must be logged in with administrative privileges to access this area.
        </p>
        <Link to="/login" className="btn-primary">
          Sign in as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 text-charcoal-800 dark:bg-charcoal-950 dark:text-sand-200">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-charcoal-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display text-xl font-bold tracking-tight text-maroon-800 dark:text-gold-400">
              Tamil<span className="text-charcoal-800 dark:text-sand-100">-Heritage</span> <span className="text-xs uppercase px-2 py-0.5 rounded bg-maroon-700/10 text-maroon-700 dark:bg-gold-500/10 dark:text-gold-300 font-sans font-bold">Admin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900" : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/submissions"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900" : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`
                }
              >
                Submissions
              </NavLink>
              <NavLink
                to="/admin/records"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900" : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`
                }
              >
                Heritage Records
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900" : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`
                }
              >
                Users & Roles
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="rounded-lg p-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <Link to="/" className="text-xs font-semibold hover:underline">
              Public Site →
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="rounded-lg bg-red-600/10 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-600/20 dark:text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Subview */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
