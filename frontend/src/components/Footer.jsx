import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const cols = [
    {
      heading: "Explore",
      links: [
        ["Explore Heritage", "/explore"],
        ["Interactive Map", "/map"],
        ["Timeline", "/timeline"],
        ["Stories", "/stories"],
      ],
    },
    {
      heading: "Culture",
      links: [
        ["Arts & Culture", "/culture"],
        ["Literature", "/explore?category=Literature"],
        ["Food Heritage", "/explore?category=Food"],
        ["Archive", "/archive"],
      ],
    },
    {
      heading: "Platform",
      links: [
        ["Contribute", "/contribute"],
        ["My Collection", "/collection"],
        ["Privacy", "/privacy"],
        ["Terms", "/terms"],
      ],
    },
  ];

  return (
    <footer className="border-t border-black/5 bg-maroon-900 text-parchment dark:border-white/10 dark:bg-charcoal-950">
      {/* decorative kolam divider */}
      <div className="flex justify-center overflow-hidden py-6 opacity-40" aria-hidden>
        <svg width="220" height="24" viewBox="0 0 220 24" fill="none">
          <g stroke="#eec759" strokeWidth="1.2">
            <path d="M0 12h88M132 12h88" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${94 + i * 8}, 12)`}>
                <circle r="3" />
                <path d="M0 -6v12M-6 0h12M-4 -4l8 8M4 -4l-8 8" />
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/kolam.svg" alt="" className="h-10 w-10" />
            <div>
              <p className="font-display text-xl font-bold text-gold-400">
                Tamil<span className="text-parchment">-Heritage</span>
              </p>
              <p className="text-xs opacity-70">{t("tagline")}</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-70">
            A public digital platform to preserve, discover and share the heritage of Tamil civilization — history, literature,
            arts, architecture, food and living traditions.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.heading}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-400">{c.heading}</h3>
            <ul className="mt-3 space-y-2">
              {c.links.map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm opacity-80 transition-opacity hover:opacity-100 hover:text-gold-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs opacity-70 sm:flex-row">
          <p>© {new Date().getFullYear()} Tamil-Heritage. Built for public cultural preservation.</p>
          <p>
            Content sources cited per record · <span className="text-gold-400">யாதும் ஊரே யாவரும் கேளிர்</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
