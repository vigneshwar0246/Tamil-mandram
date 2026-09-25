import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { HeritageCard } from "../components/cards";
import { SectionHeading, CardSkeleton, EmptyState, ErrorState } from "../components/ui";

export default function Food() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFood() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/heritage?category=food&page_size=24");
        setItems(res.items || []);
      } catch (err) {
        setError(err.message || "Failed to load food heritage records.");
      } finally {
        setLoading(false);
      }
    }
    loadFood();
  }, []);

  return (
    <div className="container-tamil space-y-10 py-10">
      <SectionHeading
        kicker={lang === "ta" ? "அறுசுவை மரபு" : "Gastronomic Heritage"}
        title={t("food.title")}
        subtitle={t("food.subtitle")}
      />

      {/* Culinary Region Highlight */}
      <div className="surface rounded-3xl p-8 border border-black/10 dark:border-white/10 shadow-md">
        <h3 className="font-display text-2xl font-bold text-maroon-800 dark:text-gold-400 mb-2">
          {lang === "ta" ? "தமிழர் உணவுப் பாரம்பரியம்" : "The Philosophy of Tamil Nutrition & Flavors"}
        </h3>
        <p className="text-base leading-relaxed opacity-85">
          {lang === "ta"
            ? "உணவே மருந்து, மருந்தே உணவு என்ற சித்த மருத்துவக் கோட்பாட்டின்படி ஆறு சுவைகளும் சேர்ந்த சரிவிகித உணவு முறையே தமிழ் சமையலின் அடித்தளம் ஆகும்."
            : "Rooted in the ancient maxim 'Food is Medicine, Medicine is Food', Tamil cuisine balances the six tastes (Arusuvai) using native spices, fermented grains, cold-pressed sesame oil, and seasonal greens described across ancient Sangam texts."}
        </p>
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
        <EmptyState title="No food heritage items found" hint="Check back soon for traditional recipes and culinary records." />
      )}
    </div>
  );
}
