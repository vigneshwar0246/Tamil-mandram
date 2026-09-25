import React from "react";
import HeritageMap from "../components/HeritageMap";
import { SectionHeading } from "../components/ui";
import { useLanguage } from "../context/LanguageContext";

export default function MapPage() {
  const { t, lang } = useLanguage();

  return (
    <div className="container-tamil space-y-6 py-8">
      <SectionHeading
        kicker={lang === "ta" ? "புவியியல் ஆய்வு" : "Cartographic Archive"}
        title={t("map.title")}
        subtitle={t("map.subtitle")}
      />
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-charcoal-900 min-h-[680px]">
        <HeritageMap />
      </div>
    </div>
  );
}
