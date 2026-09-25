import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { HeritageCard } from "../components/cards";
import { SectionHeading, CardSkeleton, EmptyState, ErrorState } from "../components/ui";

const SUB_DOMAINS = [
  { key: "all", labelEn: "All Arts & Culture", labelTa: "அனைத்தும்" },
  { key: "dance", labelEn: "Dance & Performing Arts", labelTa: "நடனக்கலை" },
  { key: "music", labelEn: "Music & Instruments", labelTa: "இசை & கருவிகள்" },
  { key: "art", labelEn: "Painting & Crafts", labelTa: "ஓவியம் & சிற்பம்" },
];

export default function Culture() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCulture() {
      setLoading(true);
      setError(null);
      try {
        let endpoint = "/heritage?page_size=24";
        if (activeTab === "all") {
          // fetch arts, dance, music items
          const res = await api.get(`${endpoint}&category=art`);
          setItems(res.items || []);
        } else {
          const res = await api.get(`${endpoint}&category=${activeTab}`);
          setItems(res.items || []);
        }
      } catch (err) {
        setError(err.message || "Failed to load cultural records.");
      } finally {
        setLoading(false);
      }
    }
    loadCulture();
  }, [activeTab]);

  return (
    <div className="container-tamil space-y-8 py-10">
      <SectionHeading
        kicker={lang === "ta" ? "கலை மரபு" : "Living Traditions"}
        title={t("culture.title")}
        subtitle={t("culture.subtitle")}
      />

      {/* Sub-category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUB_DOMAINS.map((dom) => (
          <button
            key={dom.key}
            onClick={() => setActiveTab(dom.key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              activeTab === dom.key
                ? "bg-maroon-700 text-parchment shadow-md dark:bg-gold-500 dark:text-charcoal-900"
                : "surface hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {lang === "ta" ? dom.labelTa : dom.labelEn}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <HeritageCard key={item.id || item.slug} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState title="No items found" hint="Check explore section for more records." />
      )}
    </div>
  );
}
