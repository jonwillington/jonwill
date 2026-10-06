import { useEffect, useState } from "react";

// Mirrors the response of functions/api/live.ts.
export type Rating = "significant" | "noteworthy" | "minor" | "routine";

export type Live = {
  ddbx: {
    id: string;
    url: string;
    company: string;
    ticker: string | null;
    role: string;
    valueGbp: number | null;
    rating: Rating;
    summary: string | null;
    at: string;
  } | null;
  istanbrew: {
    openNow: number;
    total: number;
    pick: { name: string; area: string | null; image: string | null; url: string } | null;
  } | null;
  generatedAt: string;
};

/** Live data for widgets and notifications. Null until loaded or if the function is unreachable (e.g. `vite dev`). */
export function useLive() {
  const [live, setLive] = useState<Live | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/live")
        .then((r) => (r.ok ? (r.json() as Promise<Live>) : null))
        .then((data) => !cancelled && data && setLive(data))
        .catch(() => {});
    load();
    const id = window.setInterval(load, 5 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);
  return live;
}

export function formatGbp(value: number | null) {
  if (value == null) return "";
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}m`;
  if (value >= 1_000) return `£${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}k`;
  return `£${Math.round(value)}`;
}
