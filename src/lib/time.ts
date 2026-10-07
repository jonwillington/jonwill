import { useEffect, useState } from "react";

import { SITE } from "../content/site";

export const TIME_ZONE = SITE.city.timeZone;
// For sunrise and sunset.
const LAT = SITE.city.lat;
const LON = SITE.city.lon;

/** Re-renders every `ms` with the current time. */
export function useNow(ms = 5_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

export const formatTime = (d: Date) =>
  d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE });

export const formatLockDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE });

/** "now", "4m ago", "2h ago", "3d ago". */
export function timeAgo(iso: string, now = new Date()) {
  const s = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/**
 * Sunrise and sunset in your city for the given day, as Dates. NOAA's
 * simplified solar equations: accurate to a minute or two, plenty here.
 */
export function sunTimes(date: Date) {
  const rad = Math.PI / 180;
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start) / 86_400_000);
  const g = ((2 * Math.PI) / 365) * (day - 1);
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const ha =
    Math.acos(Math.cos(90.833 * rad) / (Math.cos(LAT * rad) * Math.cos(decl)) - Math.tan(LAT * rad) * Math.tan(decl)) /
    rad;
  const midnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const minutes = (m: number) => new Date(midnight + m * 60_000);
  return {
    sunrise: minutes(720 - 4 * (LON + ha) - eqTime),
    sunset: minutes(720 - 4 * (LON - ha) - eqTime),
  };
}

export function isNightInCity(now = new Date()) {
  const { sunrise, sunset } = sunTimes(now);
  return now < sunrise || now >= sunset;
}
