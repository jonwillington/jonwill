import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "motion/react";

import { App } from "./App";
import { initAnalytics } from "./lib/analytics";
import { FontPicker } from "./dev/FontPicker";
import "./globals.css";

initAnalytics();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Honour the visitor's reduced-motion setting across every animation. */}
    <MotionConfig reducedMotion="user">
      <App />
      {/* Dev only: try typefaces from public/fonts. Tree-shaken out of builds. */}
      {import.meta.env.DEV && <FontPicker />}
    </MotionConfig>
  </React.StrictMode>,
);
