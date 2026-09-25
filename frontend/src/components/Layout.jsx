import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-parchment text-charcoal-800 transition-colors duration-300 dark:bg-charcoal-900 dark:text-sand-200">
      <a
        href="#main"
        className="focus-ring absolute left-4 top-4 z-[200] -translate-y-24 rounded-lg bg-maroon-700 px-4 py-2 text-sm text-parchment transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
