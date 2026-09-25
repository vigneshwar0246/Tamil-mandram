import React from "react";
import { Link } from "react-router-dom";
import { BookmarkButton } from "./BookmarkButton";
import { Card } from "./ui";

const CATEGORY_META = {
  History: { icon: "🏛️", color: "bg-maroon-700/10 text-maroon-800 dark:bg-gold-500/15 dark:text-gold-300" },
  Literature: { icon: "📜", color: "bg-green-800/10 text-green-900 dark:bg-green-500/15 dark:text-green-300" },
  Architecture: { icon: "🛕", color: "bg-terracotta-600/10 text-terracotta-700 dark:bg-terracotta-400/15 dark:text-terracotta-300" },
  Art: { icon: "🎨", color: "bg-gold-500/15 text-gold-700 dark:bg-gold-500/20 dark:text-gold-300" },
  Music: { icon: "🎼", color: "bg-indigo-900/10 text-indigo-900 dark:bg-indigo-400/15 dark:text-indigo-300" },
  Dance: { icon: "💃", color: "bg-rose-700/10 text-rose-800 dark:bg-rose-400/15 dark:text-rose-300" },
  Food: { icon: "🍛", color: "bg-amber-700/10 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300" },
  Festival: { icon: "🎆", color: "bg-purple-800/10 text-purple-900 dark:bg-purple-400/15 dark:text-purple-300" },
  Language: { icon: "🔤", color: "bg-teal-700/10 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300" },
  Person: { icon: "👤", color: "bg-slate-600/10 text-slate-800 dark:bg-slate-400/15 dark:text-slate-200" },
  Place: { icon: "📍", color: "bg-emerald-700/10 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300" },
};

export function CategoryBadge({ category, className = "" }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.History;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color} ${className}`}>
      <span aria-hidden>{meta.icon}</span>
      {category}
    </span>
  );
}

export function PeriodBadge({ period }) {
  if (!period) return null;
  return (
    <span className="inline-flex items-center rounded-full border-black/10 px-2.5 py-0.5 text-xs opacity-80 dark:border-white/15">
      {period}
    </span>
  );
}

function Img({ src, alt, className = "", fallbackIcon = "🛕" }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.replaceWith(Object.assign(document.createElement("div"), {
          className: "flex h-full w-full items-center justify-center bg-maroon-800/90 text-4xl " + className,
          textContent: fallbackIcon,
        }));
      }}
    />
  );
}

export { Img };

/* Heritage item card — the workhorse of the discover grid */
export function HeritageCard({ item }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/heritage/${item.slug}`} className="block focus-ring">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <CategoryBadge category={item.category?.name || item.category_name} />
          </div>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-maroon-700 dark:group-hover:text-gold-300">
              {item.title}
            </h3>
            <BookmarkButton itemId={item.id} />
          </div>
          <PeriodBadge period={item.period?.name || item.period_name} />
          <p className="line-clamp-2 text-sm opacity-75">{item.summary}</p>
        </div>
      </Link>
    </Card>
  );
}

export function StoryCard({ story }) {
  return (
    <Card className="group flex overflow-hidden transition-shadow hover:shadow-xl">
      <Link to={`/stories/${story.slug}`} className="flex w-full focus-ring sm:flex-col">
        <div className="relative w-32 shrink-0 sm:w-full">
          <Img src={story.cover_image_url} alt={story.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-maroon-700 dark:group-hover:text-gold-300">
            {story.title}
          </h3>
          <p className="line-clamp-2 text-sm opacity-75">{story.introduction}</p>
          <span className="mt-auto text-sm font-medium text-gold-600 dark:text-gold-400">Read Story →</span>
        </div>
      </Link>
    </Card>
  );
}

export function PlaceCard({ place }) {
  return (
    <HeritageCard item={place} />
  );
}

export function PersonCard({ person }) {
  return (
    <Card className="p-5 text-center transition-shadow hover:shadow-lg">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-maroon-800 text-2xl text-gold-400 dark:bg-gold-500/20 dark:text-gold-300">
        {CATEGORY_META.Person.icon}
      </div>
      <Link to={`/heritage/${person.slug}`} className="focus-ring">
        <h3 className="font-display text-lg font-semibold hover:text-maroon-700 dark:hover:text-gold-300">{person.title}</h3>
      </Link>
      <PeriodBadge period={person.period?.name || person.period_name} />
      <p className="mt-2 line-clamp-3 text-sm opacity-75">{person.summary}</p>
    </Card>
  );
}

export function ArchiveCard({ item }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Img src={item.image_url} alt={item.title} className="h-full w-full object-cover" fallbackIcon="📖" />
        <span className="absolute right-3 top-3 rounded-full bg-charcoal-900/70 px-2.5 py-0.5 text-xs text-parchment">{item.media_type}</span>
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="font-display font-semibold leading-snug">{item.title}</h3>
        <p className="text-xs opacity-70">
          {item.period_name || item.date_label || "Date unknown"} · {item.location_name || "Location unspecified"}
        </p>
        <p className="line-clamp-2 text-sm opacity-75">{item.description}</p>
        {item.source && <p className="text-xs italic opacity-60">Source: {item.source}</p>}
      </div>
    </Card>
  );
}

export function FoodCard({ item }) {
  return (
    <HeritageCard item={item} />
  );
}
