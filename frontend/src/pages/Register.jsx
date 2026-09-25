import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Button, toast } from "../components/ui";

export default function Register() {
  const { t, lang } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast("Password must be at least 6 characters.", "error");
      return;
    }
    setBusy(true);
    try {
      await register(name, email, password);
      toast("Account registered successfully!", "success");
      navigate("/");
    } catch (err) {
      toast(err.message || "Registration failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-tamil flex min-h-[70vh] items-center justify-center py-12">
      <div className="surface w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-4xl">📜</span>
          <h1 className="font-display text-2xl font-bold sm:text-3xl text-maroon-800 dark:text-gold-400">
            {t("auth.registerTitle")}
          </h1>
          <p className="text-xs opacity-70">
            {lang === "ta" ? "இலவச கணக்கை உருவாக்கி தமிழ் மரபைப் பாதுகாக்கவும்" : "Join our community of culture custodians and researchers"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t("auth.name")}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. Senthil Nathan"
            />
          </div>

          <div>
            <label className="label">{t("auth.email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="senthil@example.com"
            />
          </div>

          <div>
            <label className="label">{t("auth.password")}</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="•••••••• (Min 6 characters)"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full py-3" disabled={busy}>
              {busy ? "Creating account..." : t("auth.register")}
            </Button>
          </div>
        </form>

        <div className="text-center text-xs opacity-80 pt-2">
          <Link to="/login" className="text-maroon-700 font-semibold hover:underline dark:text-gold-400">
            {t("auth.haveAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
