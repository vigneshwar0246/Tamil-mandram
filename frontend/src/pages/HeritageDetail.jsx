import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { BookmarkButton } from "../components/BookmarkButton";
import { CategoryBadge, PeriodBadge, HeritageCard } from "../components/cards";
import { LoadingSkeleton, ErrorState, Button, toast, KolamDivider } from "../components/ui";

export default function HeritageDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang, pick } = useLanguage();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/heritage/${slug}`, true);
        if (active) setItem(data);
      } catch (err) {
        if (active) setError(err.message || "Failed to load heritage detail.");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchDetail();
    window.scrollTo(0, 0);
    return () => { active = false; };
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.summary,
          url: window.location.href,
        });
      } catch (err) {
        /* user cancelled */
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard!", "success");
    }
  };

  if (loading) {
    return (
      <div className="container-tamil space-y-8 py-12">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-black/10 dark:bg-white/10" />
        <div className="aspect-[21/9] w-full animate-pulse rounded-3xl bg-black/10 dark:bg-white/10" />
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container-tamil py-20">
        <ErrorState message={error || "Heritage record not found."} onRetry={() => navigate("/explore")} />
      </div>
    );
  }

  // Extract related items and regular facts from facts payload
  const relatedItems = item.facts?.find((f) => f.label === "__related__")?.value || [];
  const displayFacts = item.facts?.filter((f) => !f.label.startsWith("__")) || [];

  return (
    <article className="space-y-12 pb-20">
      {/* Top Breadcrumb navigation */}
      <div className="container-tamil pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm opacity-80">
          <Link to="/explore" className="inline-flex items-center gap-1.5 font-medium hover:text-maroon-700 dark:hover:text-gold-300">
            ← {lang === "ta" ? "மரபுகளுக்குத் திரும்பு" : "Back to Explore"}
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="btn-secondary rounded-xl px-3.5 py-1.5 text-xs font-semibold"
            >
              🔗 {lang === "ta" ? "பகிர்" : "Share"}
            </button>
            <BookmarkButton itemId={item.id} />
          </div>
        </div>
      </div>

      {/* Hero Visual & Title Header */}
      <div className="container-tamil">
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-charcoal-950 shadow-2xl dark:border-white/10">
          <div className="relative aspect-[16/9] w-full max-h-[520px] overflow-hidden">
            <img
              src={item.image_url}
              alt={item.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-parchment sm:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <CategoryBadge category={item.category?.name_en || item.category?.name || "History"} />
              <PeriodBadge period={item.period?.name} />
              {item.era && (
                <span className="rounded-full bg-gold-500/20 px-3 py-0.5 text-xs font-semibold text-gold-300 backdrop-blur">
                  {item.era}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-parchment sm:text-5xl lg:text-6xl">
              {item.title}
            </h1>

            {item.title_ta && (
              <p className="mt-2 font-tamil text-xl text-gold-300 sm:text-2xl">
                {item.title_ta}
              </p>
            )}

            {item.image_credit && (
              <p className="mt-4 text-xs opacity-60">
                Photo credit: {item.image_credit}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="container-tamil">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Left 2 Cols: Main Narrative */}
          <div className="space-y-8 lg:col-span-2">
            {/* Overview summary */}
            <div className="surface rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-maroon-800 dark:text-gold-400 mb-3">
                {lang === "ta" ? "சுருக்கம்" : "Overview"}
              </h2>
              <p className="text-lg leading-relaxed text-charcoal-800 dark:text-sand-100">
                {item.summary}
              </p>
            </div>

            {/* Detailed Description */}
            {item.description && (
              <div className="surface rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="font-display text-2xl font-bold text-maroon-800 dark:text-gold-400">
                  {lang === "ta" ? "விளக்கம்" : "Detailed History"}
                </h2>
                <div className="space-y-4 text-base leading-relaxed text-charcoal-800/90 dark:text-sand-200">
                  {item.description.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Significance Callout */}
            {item.significance && (
              <div className="rounded-2xl border-l-4 border-gold-500 bg-gold-500/10 p-6 dark:bg-gold-500/5 sm:p-8">
                <h3 className="font-display text-xl font-bold text-maroon-900 dark:text-gold-300 flex items-center gap-2 mb-2">
                  <span>✦</span> {lang === "ta" ? "வரலாற்று முக்கியத்துவம்" : "Cultural & Historical Significance"}
                </h3>
                <p className="text-base leading-relaxed text-charcoal-800 dark:text-sand-200">
                  {item.significance}
                </p>
              </div>
            )}

            {/* Tags Pill Cloud */}
            {item.tags?.length > 0 && (
              <div className="space-y-2">
                <h3 className="label">{lang === "ta" ? "குறிச்சொற்கள்" : "Keywords & Tags"}</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, idx) => (
                    <Link
                      key={idx}
                      to={`/explore?q=${encodeURIComponent(tag)}`}
                      className="rounded-lg border border-black/10 bg-black/5 px-3 py-1 text-xs font-medium transition-colors hover:border-gold-500 hover:text-maroon-700 dark:border-white/10 dark:bg-white/5 dark:hover:text-gold-300"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Fast Facts & Metadata Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts Panel */}
            <div className="surface rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-display text-lg font-bold text-maroon-800 dark:text-gold-400 border-b border-black/10 dark:border-white/10 pb-3">
                {lang === "ta" ? "விரைவு விவரங்கள்" : "Quick Facts"}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="label">{lang === "ta" ? "பிரிவு" : "Category"}</span>
                  <p className="font-semibold">{item.category?.name_en || item.category?.name || "General"}</p>
                </div>

                {item.period?.name && (
                  <div>
                    <span className="label">{lang === "ta" ? "காலம்" : "Historical Era"}</span>
                    <p className="font-semibold">{item.period.name} {item.period.start_year && `(${item.period.start_year} - ${item.period.end_year})`}</p>
                  </div>
                )}

                {item.location?.name && (
                  <div>
                    <span className="label">{lang === "ta" ? "இடம்" : "Location"}</span>
                    <p className="font-semibold">{item.location.name}, {item.location.state || "Tamil Nadu"}</p>
                  </div>
                )}

                {displayFacts.map((fact, i) => (
                  <div key={i} className="border-t border-black/5 dark:border-white/5 pt-2">
                    <span className="label">{fact.label}</span>
                    <p className="font-semibold">{fact.value}</p>
                  </div>
                ))}
              </div>

              {/* Geographic Coordinates Link */}
              {item.lat && item.lng && (
                <div className="pt-2">
                  <Link
                    to={`/map?focus=${item.slug}`}
                    className="btn-secondary w-full text-center text-xs"
                  >
                    📍 {lang === "ta" ? "வரைபடத்தில் காண்க" : "View on Heritage Map"}
                  </Link>
                </div>
              )}
            </div>

            {/* Sources & References */}
            {item.sources?.length > 0 && (
              <div className="surface rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="font-display text-base font-bold text-maroon-800 dark:text-gold-400">
                  {lang === "ta" ? "மூலங்கள் & குறிப்புகள்" : "Sources & References"}
                </h3>
                <ul className="space-y-2 text-xs opacity-80 list-disc list-inside">
                  {item.sources.map((src, i) => (
                    <li key={i}>{src}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Heritage Items */}
      {relatedItems.length > 0 && (
        <section className="container-tamil space-y-6 pt-8">
          <KolamDivider />
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {lang === "ta" ? "தொடர்புடைய மரபுப் பதிவுகள்" : "Related Heritage Highlights"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((rel) => (
              <HeritageCard key={rel.id || rel.slug} item={rel} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
