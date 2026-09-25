import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { StoryCard } from "../components/cards";
import { SectionHeading, CardSkeleton, EmptyState, ErrorState } from "../components/ui";

export default function Stories() {
  const { t, lang } = useLanguage();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const data = await api.get("/stories");
        setStories(data || []);
      } catch (err) {
        setError(err.message || "Failed to load stories.");
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, []);

  return (
    <div className="container-tamil space-y-10 py-10">
      <SectionHeading
        kicker={lang === "ta" ? "கலாச்சார ஆவணக் கதைகள்" : "Narrative Journeys"}
        title={t("stories.title")}
        subtitle={t("stories.subtitle")}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id || story.slug} story={story} />
          ))}
        </div>
      ) : (
        <EmptyState title="No stories found" hint="Stories are curated by our editorial team." />
      )}
    </div>
  );
}
