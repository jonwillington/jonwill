import React from "react";
import ReactDOM from "react-dom/client";
import { Link } from "@heroui/react";

import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-background text-foreground">
      <h1 className="text-xl font-medium tracking-tight">Jon Willington</h1>
      <Link href="mailto:hey@jonwill.ing" className="text-sm text-muted">
        hey@jonwill.ing
      </Link>
    </main>
  </React.StrictMode>,
);
