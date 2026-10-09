import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "motion/react";

import { App } from "./App";
import { ALL_ENTRIES } from "./content/apps";
import { OgCard } from "./og/OgCard";
import { initAnalytics } from "./lib/analytics";
import { FontPicker } from "./dev/FontPicker";
import "./globals.css";

// A shared link to one app (/ton/ddbx) opens like /ton#ddbx, which the rest of the site uses.
{
  const base = import.meta.env.BASE_URL;
  const parts = window.location.pathname.slice(base.length).split("/").filter(Boolean);
  const id = parts[parts.length - 1];
  if (id && ALL_ENTRIES.some((e) => e.id === id)) {
    history.replaceState(null, "", `${base}${parts.slice(0, -1).join("/")}${window.location.search}#${id}`);
  }
}

// ?og=<id>: draws the 1200×630 link-preview card for that page instead of the site
// (scripts/render-og.mjs captures them). Not linked from anywhere.
const og = new URLSearchParams(window.location.search).get("og");

if (!og) initAnalytics();

ReactDOM.createRoot(document.getElementById("root")!).render(
  og ? (
    <OgCard id={og} />
  ) : (
  <React.StrictMode>
    {/* Honour the visitor's reduced-motion setting across every animation. */}
    <MotionConfig reducedMotion="user">
      <App />
      {/* Dev only: try typefaces from public/fonts. Tree-shaken out of builds. */}
      {import.meta.env.DEV && <FontPicker />}
    </MotionConfig>
  </React.StrictMode>
  ),
);
