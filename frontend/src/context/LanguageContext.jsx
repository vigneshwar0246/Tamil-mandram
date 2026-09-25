import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext(null);

const STORAGE_KEY = "th_lang";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "ta" ? "ta" : "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang === "ta" ? "ta" : "en";
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  // t("key.path") — returns Tamil translation when available, otherwise English, otherwise the key itself.
  const t = useMemo(() => {
    return function t(key, vars) {
      const parts = key.split(".");
      let en = translations.en;
      let ta = translations.ta;
      for (const p of parts) {
        en = en ? en[p] : undefined;
        ta = ta ? ta[p] : undefined;
      }
      let out = lang === "ta" && typeof ta === "string" ? ta : typeof en === "string" ? en : key;
      if (vars && typeof out === "string") {
        for (const [k, v] of Object.entries(vars)) {
          out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return out;
    };
  }, [lang]);

  // Picks the right field of a bilingual record: title vs title_ta.
  const pick = useMemo(
    () => (obj, field) => {
      if (!obj) return "";
      const taField = `${field}_ta`;
      if (lang === "ta" && obj[taField]) return obj[taField];
      return obj[field] ?? "";
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, pick, bilingual: lang === "ta" }),
    [lang, t, pick]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
