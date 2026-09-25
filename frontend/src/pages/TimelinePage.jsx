import React from "react";
import Timeline from "../components/Timeline";
import { SectionHeading } from "../components/ui";
import { useLanguage } from "../context/LanguageContext";

export default function TimelinePage() {
  const { t, lang } = useLanguage();

  return (
    <div className="container-tamil space-y-8 py-10">
      <SectionHeading
        kicker={lang === "ta" ? "வரலாற்றுப் பேரலை" : "Chronological Horizon"}
        title={t("timeline.title")}
        subtitle={t("timeline.subtitle")}
      />
      <div className="surface rounded-3xl p-6 sm:p-10 shadow-lg">
        <Timeline />
      </div>
    </div>
  );
}
