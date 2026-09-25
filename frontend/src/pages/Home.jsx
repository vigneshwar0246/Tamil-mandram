import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { HeritageCard, StoryCard } from "../components/cards";
import { SectionHeading, CountUp, CardSkeleton, EmptyState, KolamDivider, Button } from "../components/ui";
import HeritageMap from "../components/HeritageMap";
import Timeline from "../components/Timeline";

const CATEGORY_ITEMS = [
  { slug: "history", icon: "🏛️", name: "History", nameTa: "வரலாறு", desc: "Ancient kingdoms, monuments, and historical eras" },
  { slug: "literature", icon: "📜", name: "Literature", nameTa: "இலக்கியம்", desc: "Sangam classics, epic poetry, and philosophy" },
  { slug: "architecture", icon: "🛕", name: "Architecture", nameTa: "கட்டடக்கலை", desc: "Dravidian temples, stone carvings, and structural wonders" },
  { slug: "art", icon: "🎨", name: "Arts & Crafts", nameTa: "கலைகள்", desc: "Tanjore paintings, bronze sculptures, and living crafts" },
  { slug: "music", icon: "🎼", name: "Music", nameTa: "இசை", desc: "Carnatic classical, folk melodies, and traditional instruments" },
  { slug: "dance", icon: "💃", name: "Dance", nameTa: "நடனம்", desc: "Bharatanatyam, Karakattam, and folk dances" },
  { slug: "food", icon: "🍛", name: "Cuisine", nameTa: "உணவு மரபு", desc: "Chettinad flavours, traditional grains, and ancient recipes" },
  { slug: "language", icon: "🔤", name: "Language", nameTa: "மொழி", desc: "One of the world's oldest living classical languages" },
];

export default function Home() {
  const { t, lang, pick } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [statsData, featuredData, storiesData] = await Promise.allSettled([
          api.get("/stats"),
          api.get("/heritage?featured=true&page_size=6"),
          api.get("/stories?featured=true"),
        ]);
        if (mounted) {
          if (statsData.status === "fulfilled") setStats(statsData.value);
          if (featuredData.status === "fulfilled") setFeatured(featuredData.value?.items || []);
          if (storiesData.status === "fulfilled") setStories(storiesData.value || []);
        }
      } catch (err) {
        console.error("Home data load error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-maroon-900 via-maroon-800 to-maroon-950 py-20 text-parchment shadow-2xl dark:from-charcoal-950 dark:via-charcoal-900 dark:to-charcoal-950">
        <div className="absolute inset-0 bg-kolam-dot opacity-20" aria-hidden />
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-maroon-500/10 blur-3xl" />

        <div className="container-tamil relative z-10 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300 backdrop-blur">
              <span className="text-gold-400">✦</span> {t("hero.badge")}
            </span>

            <h1 className="font-display text-4xl font-bold tracking-tight text-parchment sm:text-6xl md:text-7xl">
              {lang === "ta" ? "இலக்க முன்னோட்டத்தில் தமிழ் மரபு" : "Preserving Culture Through Digital Innovation"}
            </h1>

            <p className="text-base text-parchment/80 sm:text-xl">
              {t("hero.subtitle")}
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="mx-auto mt-8 max-w-2xl">
              <div className="relative flex items-center rounded-2xl bg-white p-2 shadow-2xl dark:bg-charcoal-800">
                <span className="pl-4 text-xl opacity-50">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("hero.searchPlaceholder")}
                  className="w-full bg-transparent px-4 py-2.5 text-base text-charcoal-900 placeholder:text-charcoal-800/50 focus:outline-none dark:text-sand-100 dark:placeholder:text-white/40"
                />
                <button
                  type="submit"
                  className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold text-parchment shadow-md"
                >
                  {lang === "ta" ? "தேடு" : "Search"}
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/explore" className="btn-primary">
                {t("hero.explore")} →
              </Link>
              <Link to="/map" className="btn-secondary text-parchment border-parchment/30 hover:bg-white/10 dark:text-sand-200">
                🗺️ {t("hero.exploreMap")}
              </Link>
              <Link to="/timeline" className="btn-secondary text-parchment border-parchment/30 hover:bg-white/10 dark:text-sand-200">
                ⏳ {lang === "ta" ? "காலவரிசை" : "Timeline"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Numerical Highlights & Stats */}
      <section className="container-tamil">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          <div className="surface rounded-2xl p-6 text-center shadow-sm">
            <p className="font-display text-3xl font-bold text-maroon-700 dark:text-gold-400 sm:text-5xl">
              <CountUp value={stats?.heritage_records || 36} />
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider opacity-75">{t("stats.records")}</p>
          </div>
          <div className="surface rounded-2xl p-6 text-center shadow-sm">
            <p className="font-display text-3xl font-bold text-maroon-700 dark:text-gold-400 sm:text-5xl">
              <CountUp value={stats?.stories || 12} />
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider opacity-75">{t("stats.stories")}</p>
          </div>
          <div className="surface rounded-2xl p-6 text-center shadow-sm">
            <p className="font-display text-3xl font-bold text-maroon-700 dark:text-gold-400 sm:text-5xl">
              <CountUp value={stats?.locations || 8} />
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider opacity-75">{t("stats.places")}</p>
          </div>
          <div className="surface rounded-2xl p-6 text-center shadow-sm">
            <p className="font-display text-3xl font-bold text-maroon-700 dark:text-gold-400 sm:text-5xl">
              <CountUp value={stats?.archive_items || 24} />
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider opacity-75">{t("stats.artifacts")}</p>
          </div>
        </div>
      </section>

      <KolamDivider />

      {/* Categories Grid */}
      <section className="container-tamil space-y-8">
        <SectionHeading
          kicker={lang === "ta" ? "களஞ்சியம்" : "Domains of Knowledge"}
          title={t("categories.title")}
          subtitle={t("categories.subtitle")}
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {CATEGORY_ITEMS.map((cat) => (
            <Link
              key={cat.slug}
              to={`/explore?category=${cat.slug}`}
              className="group surface rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-lg focus-ring"
            >
              <div className="text-3xl sm:text-4xl" aria-hidden>{cat.icon}</div>
              <h3 className="mt-3 font-display text-lg font-bold text-charcoal-900 transition-colors group-hover:text-maroon-700 dark:text-sand-100 dark:group-hover:text-gold-300">
                {lang === "ta" ? cat.nameTa : cat.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs opacity-70">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Heritage Highlights */}
      <section className="container-tamil space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            kicker={lang === "ta" ? "சிறப்புப் பதிவுகள்" : "Curated Highlights"}
            title={t("featured.title")}
            subtitle={t("featured.subtitle")}
            align="left"
          />
          <Link to="/explore?featured=true" className="btn-secondary shrink-0 text-sm">
            {lang === "ta" ? "அனைத்தையும் காண்க" : "View All Featured"} →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((item) => (
              <HeritageCard key={item.id || item.slug} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState title="No featured records yet" hint="Discover the full collection in the explore section." />
        )}
      </section>

      <KolamDivider />

      {/* Interactive Map Teaser */}
      <section className="container-tamil space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            kicker={lang === "ta" ? "புவியியல் பார்வை" : "Geographic Discovery"}
            title={t("map.title")}
            subtitle={t("map.subtitle")}
            align="left"
          />
          <Link to="/map" className="btn-primary shrink-0">
            {lang === "ta" ? "முழு வரைபடம்" : "Open Full Map"} 🗺️
          </Link>
        </div>
        <div className="overflow-hidden rounded-3xl border border-black/10 shadow-xl dark:border-white/10">
          <HeritageMap />
        </div>
      </section>

      {/* Narrative Stories */}
      {stories.length > 0 && (
        <section className="container-tamil space-y-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              kicker={lang === "ta" ? "கலாச்சாரக் கதைகள்" : "Immersive Narratives"}
              title={t("stories.title")}
              subtitle={t("stories.subtitle")}
              align="left"
            />
            <Link to="/stories" className="btn-secondary shrink-0">
              {lang === "ta" ? "அனைத்துக் கதைகளும்" : "Explore All Stories"} →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.slice(0, 3).map((story) => (
              <StoryCard key={story.id || story.slug} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* Timeline Section */}
      <section className="container-tamil space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            kicker={lang === "ta" ? "வரலாற்றுப் பயணம்" : "3,000 Years of Heritage"}
            title={t("timeline.title")}
            subtitle={t("timeline.subtitle")}
            align="left"
          />
          <Link to="/timeline" className="btn-secondary shrink-0">
            {lang === "ta" ? "முழு காலவரிசை" : "Explore Timeline"} ⏳
          </Link>
        </div>
        <div className="surface rounded-3xl p-6 shadow-md">
          <Timeline />
        </div>
      </section>

      {/* Community Contribution Banner */}
      <section className="container-tamil">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-maroon-800 to-amber-900 p-8 text-parchment shadow-2xl dark:from-charcoal-900 dark:to-maroon-950 sm:p-12">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-3xl">🪔</span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gold-300 sm:text-4xl">
              {lang === "ta" ? "உங்கள் மரபைப் பகிருங்கள்" : "Become a Heritage Custodian"}
            </h2>
            <p className="text-base text-parchment/80 sm:text-lg">
              {lang === "ta"
                ? "உங்கள் குடும்பத்து கலைப்பொருட்கள், பழங்காலப் புகைப்படங்கள் மற்றும் வரலாற்று நிகழ்வுகளை இலக்க காப்பகத்தில் பதிவேற்றுங்கள்."
                : "Help build the most comprehensive digital Tamil heritage archive by submitting local monuments, folklore, manuscripts, or community oral histories."}
            </p>
            <div className="pt-2">
              <Link to="/contribute" className="btn-primary bg-gold-500 text-charcoal-900 hover:bg-gold-400">
                {t("contribute.title")} →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
