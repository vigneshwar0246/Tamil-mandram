import React, { useContext, useState } from "react";
import { api } from "../api/client";
import { AuthContext } from "../context/AuthContext";
import { toast } from "./ui";

export function BookmarkButton({ itemId, className = "" }) {
  const { user } = useContext(AuthContext);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Login to save heritage items to your collection.", "info");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.post(`/bookmarks/${itemId}/toggle`);
      setSaved(res.saved);
      toast(res.saved ? "Saved to My Heritage Collection" : "Removed from collection", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Save to collection"}
      title={saved ? "Remove bookmark" : "Save to collection"}
      className={`focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full backdrop-blur transition-all hover:scale-110 ${saved ? "bg-gold-500 text-charcoal-900" : "bg-white/80 text-charcoal-700 dark:bg-charcoal-900/70 dark:text-sand-200"
        } ${className}`}
    >
      {saved ? "★" : "☆"}
    </button>
  );
}
