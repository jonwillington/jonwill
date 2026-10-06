import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "motion/react";

import { App } from "./App";
import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Honour the visitor's reduced-motion setting across every animation. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>,
);
