import React from "react";
import ReactDOM from "react-dom/client";
import { Link } from "@heroui/react";

import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <main className="flex flex-1 items-center justify-center">
        <h1 className="text-xl font-medium tracking-tight">Jon Willington</h1>
      </main>
      <footer className="flex justify-between px-6 py-5 text-sm">
        <Link href="mailto:hey@jonwill.ing" className="text-muted">
          hey@jonwill.ing
        </Link>
        <Link
          href="https://www.linkedin.com/in/jonathanwillington/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted"
        >
          LinkedIn
        </Link>
      </footer>
    </div>
  </React.StrictMode>,
);
