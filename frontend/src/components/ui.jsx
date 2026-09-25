import React, { useEffect, useRef, useState } from "react";

/* ---------- Card shells ---------- */

export function Card({ className = "", children, ...rest }) {
  return (
    <div className={`surface rounded-2xl border-black/5 dark:border-white/10 ${className}`} {...rest}>
      {children}
    </div>
  );
}

/* ---------- Buttons ---------- */

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }) {
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3 text-base" };
  const variants = {
    primary:
      "bg-maroon-700 text-parchment hover:bg-maroon-800 dark:bg-gold-500 dark:text-charcoal-900 dark:hover:bg-gold-400 shadow-sm",
    outline:
      "border border-maroon-700/40 text-maroon-800 hover:bg-maroon-700/5 dark:border-gold-500/40 dark:text-gold-300 dark:hover:bg-gold-500/10",
    ghost: "text-charcoal-700 hover:bg-black/5 dark:text-sand-200 dark:hover:bg-white/10",
  };
  return (
    <button className={`btn-base rounded-xl font-medium transition-colors focus-ring ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/* ---------- Loading skeleton ---------- */

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-black/10 dark:bg-white/10 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </Card>
  );
}

export function LoadingSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint, icon = "🪔" }) {
  return (
    <div className="col-span-full flex-col items-center gap-2 py-16 text-center">
      <div className="text-4xl" aria-hidden>{icon}</div>
      <p className="text-lg font-medium">{title}</p>
      {hint && <p className="max-w-md text-sm opacity-70">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="col-span-full flex-col items-center gap-3 py-16 text-center">
      <div className="text-4xl" aria-hidden>🛕</div>
      <p className="text-lg font-medium">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

/* ---------- Toast ---------- */

let toastListeners = [];

export function toast(message, kind = "info") {
  toastListeners.forEach((fn) => fn({ message, kind, id: Date.now() + Math.random() }));
}

export function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const handler = (t) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 4000);
    };
    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== handler);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex-col gap-2" role="status" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={`toast-in pointer-events-auto rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ring-black/10 dark:ring-white/10 ${t.kind === "success" ? "bg-green-800 text-white" : t.kind === "error" ? "bg-maroon-800 text-white" : "bg-charcoal-800 text-parchment"
            }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ---------- Modal ---------- */

export function Modal({ open, onClose, title, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`surface relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-2xl p-6 shadow-2xl focus-ring ${wide ? "max-w-3xl" : "max-w-lg"}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="focus-ring rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Pagination ---------- */

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-1 py-6" aria-label="Pagination">
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          aria-current={page === i + 1 ? "page" : undefined}
          className={`focus-ring h-9 w-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900" : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
        >
          {i + 1}
        </button>
      ))}
    </nav>
  );
}

/* ---------- Animated counter ---------- */

export function CountUp({ value, duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - t0) / duration);
            setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

/* ---------- Kolam divider ---------- */

export function KolamDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-8" aria-hidden>
      <span className="h-px w-24 bg-gradient-to-r from-transparent to-gold-500/60" />
      <span className="text-gold-600 dark:text-gold-400">✦</span>
      <span className="h-px w-24 bg-gradient-to-l from-transparent to-gold-500/60" />
    </div>
  );
}

/* ---------- Section heading ---------- */

export function SectionHeading({ kicker, title, subtitle, align = "center" }) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {kicker && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">{kicker}</p>
      )}
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base opacity-75">{subtitle}</p>}
    </div>
  );
}
