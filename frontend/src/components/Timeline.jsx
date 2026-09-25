import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { LoadingSkeleton, ErrorState } from "./ui";

function yearLabel(p) {
  const fmt = (y) => (y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`);
  if (p.start_year === p.end_year) return fmt(p.start_year);
  return `${fmt(p.start_year)} \u2013 ${fmt(p.end_year)}`;
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export default function Timeline({ mode = "full", maxItems = 12 }) {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [openSlug, setOpenSlug] = useState(null);
  const [items, setItems] = useState(null);

  useEffect(() => {
    api
      .get("/timeline")
      .then(setPeriods)
      .catch(() => setErr(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!openSlug) { setItems(null); return; }
    setItems(null);
    api
      .get(`/heritage?period=${encodeURIComponent(openSlug)}&limit=6`)
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]));
  }, [openSlug]);

  if (loading) return (
    <div className="py-6">
      <LoadingSkeleton lines={4} />
    </div>
  );
  if (err) return <ErrorState onRetry={() => window.location.reload()} />;
  if (periods.length === 0)
    return <p className="py-8 text-center text-sm opacity-60">No timeline data yet.</p>;

  const list = periods.slice(0, maxItems);

  if (mode === "preview") {
    return (
      <div className="relative overflow-x-auto pb-4">
        <div className="absolute left-0 right-0 top-2 h-px bg-black/10 dark:bg-white/15" />
        <ol className="flex min-w-max gap-8 px-2 pt-4">
          {list.map((p) => (
            <li key={p.slug} className="relative w-44 shrink-0">
              <span className="absolute -top-1 left-0 h-2.5 w-2.5 rounded-full border-2 border-gold-500 bg-white dark:bg-charcoal-900" />
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
                {yearLabel(p)}
              </p>
              <h3 className="mt-2 font-display text-base font-bold leading-snug">{p.name}</h3>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed opacity-60">{p.summary}</p>
              <p className="mt-2 text-[11px] font-semibold text-maroon-700 dark:text-gold-300">
                {plural(p.item_count, "record")}
              </p>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-0 left-[7px] top-0 w-px bg-gradient-to-b from-gold-500/60 via-black/10 to-transparent dark:via-white/15" />
      <ol className="space-y-8">
        {list.map((p) => {
          const open = openSlug === p.slug;
          return (
            <li key={p.slug} className="relative pl-10">
              <span
                className={
                  "absolute left-0 top-1 flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 transition-colors " +
                  (open ? "border-gold-500 bg-gold-500/30" : "border-gold-500/50 bg-white dark:bg-charcoal-900")
                }
              />
              <button
                onClick={() => setOpenSlug(open ? null : p.slug)}
                aria-expanded={open}
                className="group w-full text-left"
              >
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
                  {yearLabel(p)} &middot; {p.era}
                </p>
                <h3 className="mt-0.5 font-display text-xl font-bold transition-colors group-hover:text-maroon-700 dark:group-hover:text-gold-300">
                  {p.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed opacity-70">{p.summary}</p>
                <p className="mt-2 flex-wrap gap-x-4 text-xs font-semibold opacity-70">
                  <span className="text-maroon-700 dark:text-gold-300">{plural(p.item_count, "heritage record")}</span>
                  {p.story_count > 0 && <span>{plural(p.story_count, "story")}</span>}
                </p>
              </button>

              {open && (
                <div className="surface mt-4 rounded-xl p-5 ring-1 ring-black/5 dark:ring-white/10">
                  {p.highlights && p.highlights.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-700 dark:text-gold-400">
                        Highlights
                      </h4>
                      <ul className="mt-2 space-y-2 text-sm">
                        {p.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                            <span>
                              <strong>{h.title}</strong>
                              {h.detail ? ` \u2014 ${h.detail}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-700 dark:text-gold-400">
                    Heritage from this period
                  </h4>
                  {items === null ? (
                    <div className="mt-2">
                      <LoadingSkeleton lines={2} />
                    </div>
                  ) : items.length === 0 ? (
                    <p className="mt-2 text-sm opacity-50">No linked heritage records yet.</p>
                  ) : (
                    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {items.map((it) => (
                        <li key={it.slug}>
                          <Link
                            to={`/heritage/${it.slug}`}
                            className="text-sm hover:text-maroon-700 dark:hover:text-gold-300"
                          >
                            {it.title} <span className="opacity-50">&middot; {it.category_name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
