import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { LoadingSkeleton, toast } from "./ui";

const icon = (kind) =>
  L.divIcon({
    className: "",
    html: `<span class="map-pin ${kind === "temples" || kind === "architecture" ? "map-pin--gold" : ""}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    popupAnchor: [0, -14],
  });

/* Fly the map when the selected place changes */
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 10, { duration: 0.9 });
  }, [target, map]);
  return null;
}

/* Fit bounds to all filtered markers */
function FitBounds({ places, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (!trigger || places.length === 0) return;
    const b = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    map.fitBounds(b, { padding: [40, 40], maxZoom: 9 });
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function HeritageMap({ height = "70vh", embedded = false }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState([]);
  const [view, setView] = useState("map");
  const [fitKey, setFitKey] = useState(0);

  useEffect(() => {
    api
      .get("/map/places")
      .then(setPlaces)
      .catch(() => setErr(true))
      .finally(() => setLoading(false));
  }, []);

  const allCats = useMemo(() => [...new Set(places.map((p) => p.category).filter(Boolean))], [places]);

  const filtered = useMemo(
    () =>
      places.filter(
        (p) =>
          (cats.length === 0 || cats.includes(p.category)) &&
          (query.trim() === "" || (p.title || "").toLowerCase().includes(query.toLowerCase())),
      ),
    [places, cats, query],
  );

  if (loading) {
    return (
      <div className="surface rounded-2xl p-4" style={{ height }}>
        <LoadingSkeleton lines={5} />
        <p className="mt-3 text-center text-sm opacity-60">Mapping heritage locations…</p>
      </div>
    );
  }
  if (err) {
    return (
      <div className="surface rounded-2xl p-10 text-center" style={{ height }}>
        <p className="text-2xl">🗺️</p>
        <p className="mt-2 text-sm opacity-70">Map could not be loaded. Please try again later.</p>
      </div>
    );
  }

  const Card = ({ p, onSelect }) => (
    <button onClick={() => onSelect?.(p)} className="group block w-full text-left">
      <div className="flex gap-3">
        <img
          src={p.image_url}
          alt={p.title}
          loading="lazy"
          className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-black/10 dark:ring-white/10"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold group-hover:text-maroon-700 dark:group-hover:text-gold-300">{p.title}</p>
          <p className="truncate text-xs opacity-60">{p.era || "—"} · {p.category}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border-black/10 shadow-lg dark:border-white/10" style={{ height }}>
      <div className="absolute" style={{ display: "none" }}>
        {/* keep clustering helpers referenced */}
      </div>
      <div className="relative h-full">
        {/* toolbar */}
        <div className="absolute left-3 right-3 top-3 z-[500] flex flex-wrap items-center gap-2">
          <div className="surface flex items-center gap-2 rounded-xl px-3 py-1.5 shadow-md ring-1 ring-black/10 dark:ring-white/10">
            <span aria-hidden>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places on map…"
              aria-label="Search map places"
              className="w-40 bg-transparent text-sm outline-none placeholder:text-charcoal-500/50"
            />
          </div>
          <div className="surface flex flex-wrap gap-1.5 rounded-xl p-1.5 shadow-md ring-1 ring-black/10 dark:ring-white/10">
            {allCats.slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => setCats((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]))}
                aria-pressed={cats.includes(c)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${cats.includes(c)
                    ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900"
                    : "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="surface ml-auto flex overflow-hidden rounded-xl shadow-md ring-1 ring-black/10 dark:ring-white/10">
            {["map", "list"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`px-3 py-1.5 text-xs font-semibold capitalize ${view === v ? "bg-maroon-700 text-parchment dark:bg-gold-500 dark:text-charcoal-900" : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === "map" ? (
          <MapContainer
            center={[10.7905, 78.7047]}
            zoom={7}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%", background: "#0f0d0c" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={document.documentElement.classList.contains("dark")
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
            />
            {filtered.map((p) => (
              <Marker key={p.slug} position={[p.lat, p.lng]} icon={icon(p.category)} eventHandlers={{ click: () => setSelected(p) }}>
                <Popup>
                  <div className="w-56">
                    <img src={p.image_url} alt="" className="mb-2 h-24 w-full rounded-lg object-cover" />
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-xs opacity-60">{p.era} · {p.category}</p>
                    <Link
                      to={`/heritage/${p.slug}`}
                      className="mt-2 block rounded-lg bg-maroon-700 px-3 py-1.5 text-center text-xs font-semibold text-white"
                    >
                      Explore
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
            <FlyTo target={selected} />
            <FitBounds places={filtered} trigger={fitKey} />
          </MapContainer>
        ) : (
          <div className="h-full overflow-y-auto p-4 pt-20">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <div key={p.id} className="surface rounded-xl p-3 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                  <Card p={p} />
                  <Link
                    to={`/heritage/${p.slug}`}
                    className="mt-2 block rounded-lg bg-maroon-700/10 px-3 py-1.5 text-center text-xs font-semibold text-maroon-700 dark:bg-gold-500/10 dark:text-gold-300"
                  >
                    Open record →
                  </Link>
                </div>
              ))}
              {filtered.length === 0 && <p className="col-span-full py-10 text-center text-sm opacity-60">No places match your filters.</p>}
            </div>
          </div>
        )}

        {/* nearby panel */}
        {selected && view === "map" && (
          <div className="surface absolute bottom-4 left-3 right-3 z-[500] mx-auto max-w-xl rounded-2xl p-4 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 sm:left-auto sm:right-4 sm:w-96">
            <button onClick={() => setSelected(null)} className="float-right text-lg opacity-50 hover:opacity-100" aria-label="Close panel">
              ✕
            </button>
            <img src={selected.image_url} alt="" className="h-32 w-full rounded-xl object-cover" />
            <h3 className="mt-2 font-display text-lg font-bold">{selected.title}</h3>
            <p className="text-xs opacity-60">
              📍 Tamil Nadu · {selected.era} · {selected.category}
            </p>
            <p className="mt-2 text-sm leading-relaxed opacity-80">{selected.item_type}</p>
            <div className="mt-3 flex gap-2">
              <Link
                to={`/heritage/${selected.slug}`}
                className="btn-base rounded-lg bg-maroon-700 px-4 py-2 text-xs font-semibold text-parchment hover:bg-maroon-800 dark:bg-gold-500 dark:text-charcoal-900"
              >
                Explore
              </Link>
              <button
                onClick={() => {
                  const near = places
                    .filter((p) => p.slug !== selected.slug)
                    .map((p) => ({ ...p, d: Math.hypot(p.lat - selected.lat, p.lng - selected.lng) }))
                    .sort((a, b) => a.d - b.d)
                    .slice(0, 3);
                  setSelected(null);
                  toast(
                    near.length ? `Nearby: ${near.map((n) => n.title).join(", ")}` : "No nearby places found.",
                    "info",
                  );
                }}
                className="btn-base rounded-lg border-black/10 px-4 py-2 text-xs font-semibold hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Nearby heritage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
