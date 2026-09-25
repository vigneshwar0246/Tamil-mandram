import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { SectionHeading, Button, toast } from "../components/ui";

export default function Contribute() {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    content_type: "article",
    title: "",
    description: "",
    location_name: "",
    source_note: "",
    permission_confirmed: false,
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.permission_confirmed) {
      toast("Please confirm you have the right to share this content.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("content_type", form.content_type);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("location_name", form.location_name);
      formData.append("source_note", form.source_note);
      formData.append("permission_confirmed", "true");
      if (file) {
        formData.append("files", file);
      }

      const res = await fetch("http://127.0.0.1:8000/api/submissions", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Submission failed");
      }

      setSubmitted(true);
      toast(t("contribute.success"), "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container-tamil max-w-2xl py-20 text-center space-y-6">
        <div className="text-6xl">🪔</div>
        <h2 className="font-display text-3xl font-bold text-maroon-800 dark:text-gold-400">
          {lang === "ta" ? "நன்றி! உங்கள் பங்களிப்பு பெறப்பட்டது." : "Thank You for Preserving Tamil Heritage"}
        </h2>
        <p className="text-base opacity-80">
          {t("contribute.success")}
        </p>
        <Button onClick={() => setSubmitted(false)} variant="primary">
          {lang === "ta" ? "மற்றொரு பதிவை சமர்ப்பிக்கவும்" : "Submit Another Contribution"}
        </Button>
      </div>
    );
  }

  return (
    <div className="container-tamil max-w-3xl space-y-10 py-10">
      <SectionHeading
        kicker={lang === "ta" ? "மக்கள் பங்களிப்பு" : "Community Curation"}
        title={t("contribute.title")}
        subtitle={t("contribute.subtitle")}
      />

      <form onSubmit={handleSubmit} className="surface rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="label">{t("contribute.name")} *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="e.g. Anandha Kumar"
            />
          </div>

          <div>
            <label className="label">{t("contribute.email")} *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="anand@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="label">{t("contribute.contentType")}</label>
            <select
              value={form.content_type}
              onChange={(e) => setForm({ ...form, content_type: e.target.value })}
              className="input"
            >
              <option value="place">{lang === "ta" ? "மரபு இடம் / கோவில்" : "Historical Monument / Place"}</option>
              <option value="story">{lang === "ta" ? "கலாச்சாரக் கதை / வாய்மொழி வரலாறு" : "Story / Oral History"}</option>
              <option value="manuscript">{lang === "ta" ? "ஏட்டுச்சுவடி / ஆவணம்" : "Manuscript / Inscription"}</option>
              <option value="art">{lang === "ta" ? "கலை / கைவினைப்பொருள்" : "Art / Craft"}</option>
              <option value="recipe">{lang === "ta" ? "பாரம்பரிய உணவு முறை" : "Traditional Food / Recipe"}</option>
            </select>
          </div>

          <div>
            <label className="label">{t("contribute.location")}</label>
            <input
              type="text"
              value={form.location_name}
              onChange={(e) => setForm({ ...form, location_name: e.target.value })}
              className="input"
              placeholder="e.g. Thanjavur, Madurai, Jaffna"
            />
          </div>
        </div>

        <div>
          <label className="label">{t("contribute.itemTitle")} *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
            placeholder="e.g. 8th Century Pallava Rock-cut Temple at Mandagapattu"
          />
        </div>

        <div>
          <label className="label">{t("contribute.description")} *</label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input"
            placeholder="Describe the historical context, oral narrative, or significance..."
          />
        </div>

        <div>
          <label className="label">{t("contribute.source")}</label>
          <input
            type="text"
            value={form.source_note}
            onChange={(e) => setForm({ ...form, source_note: e.target.value })}
            className="input"
            placeholder="Family heirloom, local temple epigraph, archival record..."
          />
        </div>

        <div>
          <label className="label">{lang === "ta" ? "புகைப்படம் / ஆவணம் இணைக்க" : "Attach Photo / Document (Optional)"}</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,.mp3,.mp4"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="input file:mr-4 file:rounded-lg file:border-0 file:bg-maroon-700 file:px-4 file:py-1 file:text-xs file:font-semibold file:text-parchment"
          />
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="rights"
            required
            checked={form.permission_confirmed}
            onChange={(e) => setForm({ ...form, permission_confirmed: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-maroon-600 focus:ring-gold-500"
          />
          <label htmlFor="rights" className="text-xs opacity-80 cursor-pointer">
            {t("contribute.permission")}
          </label>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={submitting}
          >
            {submitting ? (lang === "ta" ? "சமர்ப்பிக்கப்படுகிறது..." : "Submitting...") : t("contribute.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
