import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { HeritageCard } from "../components/cards";
import { SectionHeading, CardSkeleton, EmptyState, ErrorState, Pagination, Button } from "../components/ui";

export default function Explore() {
  const { t, lang, pick } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter & Search states
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [period, setPeriod] = useState(searchParams.get("period") || "");
  const [itemType, setItemType] = useState(searchParams.get("item_type") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // Data states
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersData, setFiltersData] = useState({ categories: [], periods: [], locations: [], item_types: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch filter metadata
  useEffect(() => {
    async function loadFilters() {
      try {
        const data = await api.get("/heritage/filters");
        setFiltersData(data);
      } catch (err) {
        console.error("Failed to load filter aggregates", err);
      }
    }
    loadFilters();
  }, []);

  // Synchronize state with URL query parameters
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "");
    setPeriod(searchParams.get("period") || "");
    setItemType(searchParams.get("item_type") || "");
    setSort(searchParams.get("sort") || "newest");
    setPage(parseInt(searchParams.get("page") || "1", 10));
  }, [searchParams]);

  // Fetch heritage records
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      if (period) params.set("period", period);
      if (itemType) params.set("item_type", itemType);
      if (sort) params.set("sort", sort);
      params.set("page", page.toString());
      params.set("page_size", "12");

      const res = await api.get(`/heritage?${params.toString()}`);
      setItems(res.items || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load heritage records.");
    } finally {
      setLoading(false);
    }
  }, [query, category, period, itemType, sort, page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Helper to update search params
  const updateParam = (key, value) => {
    const updated = new URLSearchParams(searchParams);
    if (value) {
      updated.set(key, value);
    } else {
      updated.delete(key);
    }
    updated.set("page", "1");
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam("q", query);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setQuery("");
    setCategory("");
    setPeriod("");
    setItemType("");
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters = Boolean(query || category || period || itemType);

  return (
    <div className="container-tamil space-y-8 py-10">
      <SectionHeading
        kicker={lang === "ta" ? "மரபுக் களஞ்சியம்" : "Tamil Heritage Archive"}
        title={lang === "ta" ? "மரபுகளை ஆய்க" : "Explore Heritage Records"}
        subtitle={lang === "ta" ? "கோவில்கள், இலக்கியம், கலை, பண்பாட்டு நினைவுச் சின்னங்கள்" : "Search and discover thousands of years of art, architecture, literature, and living traditions"}
      />

      {/* Filter Control Bar */}
      <div className="surface rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3 text-lg opacity-40">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("hero.searchPlaceholder")}
              className="input pl-10"
            />
          </div>
          <Button type="submit" variant="primary" className="shrink-0">
            {lang === "ta" ? "தேடு" : "Search"}
          </Button>
          {hasActiveFilters && (
            <Button type="button" variant="ghost" onClick={clearAllFilters} className="shrink-0 text-xs">
              {lang === "ta" ? "அனைத்தையும் நீக்கு ✕" : "Clear Filters ✕"}
            </Button>
          )}
        </form>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Category Selector */}
          <div>
            <label className="label">{t("filters.category")}</label>
            <select
              value={category}
              onChange={(e) => updateParam("category", e.target.value)}
              className="input text-sm"
            >
              <option value="">{lang === "ta" ? "அனைத்து வகைகளும்" : "All Categories"}</option>
              {filtersData.categories?.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {lang === "ta" && cat.name_ta ? cat.name_ta : cat.name_en} ({cat.item_count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Historical Period Selector */}
          <div>
            <label className="label">{t("filters.period")}</label>
            <select
              value={period}
              onChange={(e) => updateParam("period", e.target.value)}
              className="input text-sm"
            >
              <option value="">{lang === "ta" ? "அனைத்து காலங்களும்" : "All Eras & Periods"}</option>
              {filtersData.periods?.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {lang === "ta" && p.name_ta ? p.name_ta : p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Type Selector */}
          <div>
            <label className="label">{lang === "ta" ? "உள்ளடக்க வகை" : "Heritage Type"}</label>
            <select
              value={itemType}
              onChange={(e) => updateParam("item_type", e.target.value)}
              className="input text-sm"
            >
              <option value="">{lang === "ta" ? "அனைத்து வகைகளும்" : "All Types"}</option>
              {filtersData.item_types?.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.type} ({t.count})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Selector */}
          <div>
            <label className="label">{lang === "ta" ? "வரிசைப்படுத்து" : "Sort Order"}</label>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="input text-sm"
            >
              <option value="newest">{lang === "ta" ? "சமீபத்தியவை" : "Newest Added"}</option>
              <option value="popular">{lang === "ta" ? "பிரபலமானவை" : "Most Viewed"}</option>
              <option value="title">{lang === "ta" ? "அகரவரிசை (A-Z)" : "Title (A-Z)"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm opacity-80">
        <p>
          {loading ? (
            <span>{t("states.loading")}</span>
          ) : (
            <span>
              {lang === "ta"
                ? `${totalCount} மரபுப் பதிவுகள் கண்டறியப்பட்டன`
                : `${totalCount} heritage records found`}
            </span>
          )}
        </p>
      </div>

      {/* Heritage Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRecords} />
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <HeritageCard key={item.id || item.slug} item={item} />
            ))}
          </div>
          <Pagination
            page={page}
            pages={totalPages}
            onChange={(newPage) => {
              const updated = new URLSearchParams(searchParams);
              updated.set("page", newPage.toString());
              setSearchParams(updated);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      ) : (
        <EmptyState
          title={t("states.noResults")}
          hint={lang === "ta" ? "வேறு தேடல் சொற்கள் அல்லது வடிகட்டிகளைப் பயன்படுத்தவும்." : "Try adjusting your search terms or resetting the filters."}
        />
      )}
    </div>
  );
}
