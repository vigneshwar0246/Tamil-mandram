import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { LoadingSkeleton, ErrorState, KolamDivider } from "../components/ui";

export default function StoryDetail() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStory() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/stories/${slug}`);
        setStory(data);
      } catch (err) {
        setError(err.message || "Failed to load story.");
      } finally {
        setLoading(false);
      }
    }
    fetchStory();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container-tamil max-w-3xl space-y-6 py-12">
        <div className="h-6 w-32 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="container-tamil py-20">
        <ErrorState message={error || "Story not found"} />
      </div>
    );
  }

  return (
    <article className="container-tamil max-w-4xl space-y-8 py-10">
      <Link to="/stories" className="inline-flex items-center gap-2 text-sm font-medium hover:text-maroon-700 dark:hover:text-gold-300">
        ← {lang === "ta" ? "அனைத்துக் கதைகளுக்கும் திரும்பு" : "Back to Stories"}
      </Link>

      {/* Story Header */}
      <div className="space-y-4">
        {story.period?.name && (
          <span className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-600 dark:text-gold-300">
            {story.period.name}
          </span>
        )}
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl text-charcoal-900 dark:text-sand-100">
          {story.title}
        </h1>
        {story.author && (
          <p className="text-sm opacity-70">
            By <span className="font-semibold">{story.author}</span> · {story.read_time_mins || 5} min read
          </p>
        )}
      </div>

      {/* Featured Cover Image */}
      {story.cover_image_url && (
        <div className="overflow-hidden rounded-3xl border border-black/10 shadow-xl dark:border-white/10">
          <img
            src={story.cover_image_url}
            alt={story.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}

      {/* Lead Introduction */}
      {story.introduction && (
        <div className="border-l-4 border-maroon-700 pl-4 text-xl font-serif italic text-charcoal-800 dark:border-gold-500 dark:text-sand-200">
          {story.introduction}
        </div>
      )}

      <KolamDivider />

      {/* Story Main Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-charcoal-800/90 dark:text-sand-200 leading-relaxed font-body">
        {story.content ? (
          story.content.split("\n\n").map((chunk, i) => (
            <p key={i}>{chunk}</p>
          ))
        ) : (
          <p>No content available for this story.</p>
        )}
      </div>
    </article>
  );
}
