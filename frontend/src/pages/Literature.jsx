import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { HeritageCard } from "../components/cards";
import { SectionHeading, CardSkeleton, EmptyState, ErrorState, KolamDivider } from "../components/ui";

const SANGAM_QUOTES = [
  {
    kural: "யாதும் ஊரே யாவரும் கேளிர்",
    author: "கணியன் பூங்குன்றனார் (புறநானூறு 192)",
    meaning: "Every city is my native place, and all people are my kin.",
  },
  {
    kural: "கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக",
    author: "திருவள்ளுவர் (திருக்குறள் 391)",
    meaning: "Learn flawlessly what is to be learned, and afterwards walk in the way of what you have learned.",
  },
  {
    kural: "பிறப்பொக்கும் எல்லா உயிர்க்கும்",
    author: "திருவள்ளுவர் (திருக்குறள் 972)",
    meaning: "All living beings are equal by birth.",
  },
];

export default function Literature() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadLiterature() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/heritage?category=literature&page_size=24");
        setItems(res.items || []);
      } catch (err) {
        setError(err.message || "Failed to load literature records.");
      } finally {
        setLoading(false);
      }
    }
    loadLiterature();
  }, []);

  return (
    <div className="container-tamil space-y-10 py-10">
      <SectionHeading
        kicker={lang === "ta" ? "செம்மொழிச் செல்வம்" : "Classical & Modern Canon"}
        title={t("literature.title")}
        subtitle={t("literature.subtitle")}
      />

      {/* Featured Literary Quotes Banner */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {SANGAM_QUOTES.map((q, idx) => (
          <div
            key={idx}
            className="surface rounded-2xl p-6 border-l-4 border-maroon-700 dark:border-gold-500 shadow-sm space-y-3"
          >
            <p className="font-tamil text-lg font-semibold text-maroon-900 dark:text-gold-300">
              "{q.kural}"
            </p>
            <p className="text-xs font-semibold text-charcoal-600 dark:text-sand-400">
              — {q.author}
            </p>
            <p className="text-xs italic opacity-75">
              "{q.meaning}"
            </p>
          </div>
        ))}
      </div>

      <KolamDivider />

      {/* Literature Records Grid */}
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
        <EmptyState title="No literature items found" hint="Check back as we digitize more manuscripts." />
      )}
    </div>
  );
}
