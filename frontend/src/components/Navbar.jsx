import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { toast } from "./ui";

/* Debounced global search with suggestion dropdown */
export function SearchBar({ compact = false, autoFocus = false, onNavigate }) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("th_search_history") || "[]");
    } catch {
      return [];
    }
  });
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const data = await api.get(`/heritage/suggestions?q=${encodeURIComponent(q.trim())}`);
        setSuggestions(data.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const saveHistory = (term) => {
    const next = [term, ...history.filter((h) => h !== term)].slice(0, 5);
    setHistory(next);
    localStorage.setItem("th_search_history", JSON.stringify(next));
  };

  const go = (term) => {
    const clean = term.trim();
    if (!clean) return;
    saveHistory(clean);
    setOpen(false);
    navigate(`/explore?q=${encodeURIComponent(clean)}`);
    onNavigate?.();
  };

  const hasDropdown = q.trim() ? suggestions.length > 0 : history.length > 0;

  return (
    <div ref={boxRef} className={`relative ${compact ? "w-48 focus-within:w-72" : "w-full"} transition-all duration-300`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
      >
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          placeholder={compact ? "Search heritage…" : "Search places, people, temples, art forms…"}
          aria-label="Search heritage"
          className={`w-full rounded-xl border-black/10 bg-white/70 px-4 py-2 text-sm shadow-inner outline-none transition-colors placeholder:text-charcoal-500/60 focus:border-gold-500/60 dark:border-white/10 dark:bg-charcoal-800/70 dark:placeholder:text-sand-300/40 ${compact ? "pr-9" : "pr-10 py-3"
            }`}
        />
        <button
          type="submit"
          aria-label="Search"
          className={`absolute top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-maroon-700 dark:text-sand-300/60 dark:hover:text-gold-300 ${compact ? "right-3" : "right-4"}`}
        >
          🔍
        </button>
      </form>

      {open && hasDropdown && (
        <div className="surface absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl shadow-xl ring-1 ring-black/10 dark:ring-white/10">
          {q.trim() ? (
            suggestions.map((s) => (
              <button
                key={s.slug}
                onClick={() => {
                  setOpen(false);
                  navigate(`/heritage/${s.slug}`);
                  onNavigate?.();
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-maroon-700/5 dark:hover:bg-gold-500/10"
              >
                <span className="truncate">{s.title}</span>
                <span className="shrink-0 text-xs opacity-60">{s.category_name}</span>
              </button>
            ))
          ) : (
            <>
              <p className="px-4 pt-2 text-xs font-semibold uppercase tracking-wide opacity-50">Recent searches</p>
              {history.map((h) => (
                <button
                  key={h}
                  onClick={() => go(h)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-maroon-700/5 dark:hover:bg-gold-500/10"
                >
                  <span aria-hidden>🕘</span> {h}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title="Toggle theme"
      className="focus-ring rounded-lg p-2 text-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

function LangSwitcher() {
  const { lang, setLang, t } = useLanguage();
  return (
    <div className="flex overflow-hidden rounded-lg border-black/15 text-xs font-semibold dark:border-white/15" role="group" aria-label="Language">
      {["en", "ta"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1.5 transition-colors ${lang === l ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900" : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
        >
          {l === "en" ? "English" : t("tamil")}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const navLink = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring ${isActive
      ? "text-maroon-700 dark:text-gold-300"
      : "text-charcoal-700 hover:text-maroon-700 dark:text-sand-200 dark:hover:text-gold-300"
    }`;

  const links = [
    { to: "/explore", label: t("nav_explore") },
    { to: "/map", label: t("nav_map") },
    { to: "/timeline", label: t("nav_timeline") },
    { to: "/stories", label: t("nav_stories") },
    { to: "/culture", label: t("nav_culture") },
    { to: "/archive", label: t("nav_archive") },
    { to: "/contribute", label: t("nav_contribute") },
  ];

  return (
    <header className="sticky top-0 z-[100] border-b border-black/5 bg-parchment/80 backdrop-blur-lg dark:border-white/10 dark:bg-charcoal-900/80">
      {/* top strip */}
      <div className="bg-maroon-800 text-parchment dark:bg-charcoal-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <p className="tracking-wide opacity-90">🪔 {t("tagline")}</p>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="focus-ring flex items-center gap-2.5" aria-label="Tamil-Heritage home">
          <img src="/kolam.svg" alt="" className="h-9 w-9" />
          <span className="font-display text-xl font-bold tracking-tight text-maroon-800 dark:text-gold-400">
            Tamil<span className="text-gold-600 dark:text-gold-300">-Heritage</span>
          </span>
        </Link>

        <nav className="ml-2 hidden flex-1 items-center gap-0.5 xl:flex" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLink}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden lg:block">
            <SearchBar compact />
          </div>
          <div className="relative" ref={menuRef}>
            {user ? (
              <>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  className="focus-ring flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-maroon-700 text-xs font-bold text-parchment dark:bg-gold-500 dark:text-charcoal-900">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                  </span>
                  <span className="hidden text-sm font-medium sm:block">{user.name || user.email?.split("@")[0]}</span>
                </button>
                {menuOpen && (
                  <div className="surface absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl shadow-xl ring-1 ring-black/10 dark:ring-white/10">
                    {[
                      { label: t("nav_collection"), to: "/collection" },
                      ...(isAdmin ? [{ label: t("nav_admin"), to: "/admin" }] : []),
                    ].map((i) => (
                      <Link
                        key={i.to}
                        to={i.to}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:bg-maroon-700/5 dark:hover:bg-gold-500/10"
                      >
                        {i.label}
                      </Link>
                    ))}
                    <button
                      onClick={async () => {
                        await logout();
                        setMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full border-t border-black/5 px-4 py-2.5 text-left text-sm text-maroon-700 hover:bg-maroon-700/5 dark:border-white/10 dark:text-gold-300 dark:hover:bg-gold-500/10"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="btn-base focus-ring rounded-xl bg-maroon-700 px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-maroon-800 dark:bg-gold-500 dark:text-charcoal-900 dark:hover:bg-gold-400"
              >
                {t("login")}
              </Link>
            )}
          </div>
          <button
            className="focus-ring rounded-lg p-2 text-xl xl:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="border-t border-black/5 dark:border-white/10 xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3" aria-label="Mobile">
            <div className="pb-2">
              <SearchBar onNavigate={() => setMobileOpen(false)} />
            </div>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? "bg-maroon-700/10 text-maroon-700 dark:bg-gold-500/10 dark:text-gold-300" : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
