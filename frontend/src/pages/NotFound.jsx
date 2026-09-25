import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/ui";

export default function NotFound() {
  const { lang } = useLanguage();

  return (
    <div className="container-tamil flex min-h-[60vh] flex-col items-center justify-center py-20 text-center space-y-6">
      <div className="text-7xl">🛕</div>
      <h1 className="font-display text-4xl font-bold sm:text-6xl text-maroon-800 dark:text-gold-400">
        404
      </h1>
      <h2 className="font-display text-2xl font-semibold">
        {lang === "ta" ? "பக்கம் கிடைக்கவில்லை" : "Heritage Page Not Found"}
      </h2>
      <p className="max-w-md text-sm opacity-75">
        {lang === "ta"
          ? "நீங்கள் தேடும் பக்கம் இடம் மாற்றப்பட்டிருக்கலாம் அல்லது அகற்றப்பட்டிருக்கலாம்."
          : "The page or heritage record you are looking for does not exist or has been relocated."}
      </p>
      <div className="flex gap-4 pt-4">
        <Link to="/" className="btn-primary">
          {lang === "ta" ? "முகப்பிற்குச் செல்க" : "Return Home"}
        </Link>
        <Link to="/explore" className="btn-secondary">
          {lang === "ta" ? "மரபுகளை ஆய்க" : "Explore Heritage"}
        </Link>
      </div>
    </div>
  );
}
