import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { ArchiveCard } from "../components/cards";
import { SectionHeading, CardSkeleton, EmptyState, ErrorState, Pagination, Button } from "../components/ui";

export default function Archive() {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ total: 0, pages: 1, items: [], kinds: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArchive() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (kind) params.set("kind", kind);
        params.set("page", page.toString());
        params.set("page_size", "12");

        const res = await api.get(`/archive?${params.toString()}`);
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load archive items.");
      } finally {
        setLoading(false);
      }
    }
    fetchArchive();
  }, [search, kind, page]);

  return (
    <div className="container-tamil space-y-8 py-10">
      <SectionHeading
        kicker={lang === "ta" ? "டிஜிட்டல் ஆவணக் காப்பகம்" : "Preserved Media"}
        title={t("archive.title")}
        subtitle={t("archive.subtitle")}
      />

      {/* Filter and Search Bar */}
      <div className="surface rounded-2xl p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-3 text-lg opacity-40">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={lang === "ta" ? "காப்பகத்தில் தேடுக..." : "Search manuscripts, inscriptions, photographs..."}
            className="input pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setKind(""); setPage(1); }}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              kind === "" ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900" : "surface hover:bg-black/5"
            }`}
          >
            {lang === "ta" ? "அனைத்தும்" : "All Media"}
          </button>
          {data.kinds?.map((k) => (
            <button
              key={k.kind}
              onClick={() => { setKind(k.kind); setPage(1); }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all ${
                kind === k.kind ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900" : "surface hover:bg-black/5"
              }`}
            >
              {k.kind} ({k.count})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : data.items?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((item) => (
              <ArchiveCard key={item.id || item.slug} item={item} />
            ))}
          </div>
          <Pagination page={page} pages={data.pages} onChange={(p) => setPage(p)} />
        </>
      ) : (
        <EmptyState
          title="No archive items found"
          hint="Try adjusting your search criteria or filter."
        />
      )}
    </div>
  );
}
