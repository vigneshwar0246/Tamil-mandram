import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { HeritageCard } from "../components/cards";
import { SectionHeading, CardSkeleton, EmptyState, Button } from "../components/ui";

export default function Collection() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    async function loadBookmarks() {
      try {
        const data = await api.get("/me/bookmarks", true);
        setItems(data || []);
      } catch (err) {
        console.error("Failed to load collection", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookmarks();
  }, [user, navigate]);

  return (
    <div className="container-tamil space-y-8 py-10">
      <SectionHeading
        kicker={lang === "ta" ? "என் சேகரிப்பு" : "Personal Archive"}
        title={t("nav.myCollection")}
        subtitle={lang === "ta" ? "நீங்கள் சேமித்த தமிழ் மரபுப் பதிவுகள்" : "Your bookmarked monuments, literature, and culture entries"}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <HeritageCard key={item.id || item.slug} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={lang === "ta" ? "இன்னும் எந்த பதிவுகளும் சேமிக்கப்படவில்லை" : "Your collection is empty"}
          hint={lang === "ta" ? "மரபுகளை ஆராய்ந்து நட்சத்திர குறியீட்டை அழுத்தி சேமிக்கவும்." : "Explore the heritage archive and click the star icon to save items here."}
          icon="★"
        />
      )}
    </div>
  );
}
