import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Button, toast } from "../components/ui";

export default function Login() {
  const { t, lang } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email, password);
      toast("Welcome back!", "success");
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast(err.message || "Invalid credentials", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-tamil flex min-h-[70vh] items-center justify-center py-12">
      <div className="surface w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-4xl">🏛️</span>
          <h1 className="font-display text-2xl font-bold sm:text-3xl text-maroon-800 dark:text-gold-400">
            {t("auth.loginTitle")}
          </h1>
          <p className="text-xs opacity-70">
            {lang === "ta" ? "உங்கள் கணக்கில் உள்நுழைக" : "Sign in to access your saved heritage items and submissions"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t("auth.email")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@tamilheritage.org"
            />
          </div>

          <div>
            <label className="label">{t("auth.password")}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full py-3" disabled={busy}>
              {busy ? "Signing in..." : t("auth.login")}
            </Button>
          </div>
        </form>

        <div className="text-center text-xs opacity-80 pt-2">
          <Link to="/register" className="text-maroon-700 font-semibold hover:underline dark:text-gold-400">
            {t("auth.noAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
