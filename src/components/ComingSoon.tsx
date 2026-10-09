import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { buttonVariants } from "@heroui/react";

import type { AppEntry } from "../content/apps";
import { track } from "../lib/analytics";
import { CloseX } from "./CloseX";
import { BIG_BUTTON, SECONDARY } from "./DetailPanel";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * An "App Store" button for an app that isn't out yet. It opens a small "coming
 * soon" modal with an email field; sign-ups go to /api/waitlist, which mails Jon.
 */
export function ComingSoonButton({ entry }: { entry: AppEntry }) {
  const button = useRef<HTMLButtonElement>(null);
  const [host, setHost] = useState<{ el: Element; inDrawer: boolean; theme?: string } | null>(null);

  const open = () => {
    const el = button.current;
    if (!el) return;
    track("coming_soon_open", { app: entry.id });
    // Inside the Learn more drawer, stay inside it: the drawer traps focus and clicks,
    // so a modal on <body> couldn't be typed into. Elsewhere, cover the page.
    const drawer = el.closest("[data-vaul-drawer]");
    setHost({
      el: drawer ?? document.body,
      inDrawer: !!drawer,
      theme: el.closest("[data-theme]")?.getAttribute("data-theme") ?? undefined,
    });
  };

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={open}
        className={buttonVariants({ size: "lg", className: `${BIG_BUTTON} ${SECONDARY}` })}
      >
        App Store
      </button>
      {host &&
        createPortal(
          <ComingSoonModal entry={entry} theme={host.theme} inDrawer={host.inDrawer} onClose={() => setHost(null)} />,
          host.el,
        )}
    </>
  );
}

function ComingSoonModal({
  entry,
  theme,
  inDrawer,
  onClose,
}: {
  entry: AppEntry;
  theme?: string;
  /** Cover just the drawer (its sheet is the positioned parent), not the whole window. */
  inDrawer: boolean;
  onClose: () => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    input.current?.focus({ preventScroll: true });
    // Capture phase, so Escape closes this and not the drawer underneath.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          app: entry.name,
          email: form.get("email"),
          company: form.get("company"),
          page: `${location.pathname}${location.hash}`,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      track("coming_soon_signup", { app: entry.id });
    } catch {
      setStatus("error");
    }
  };

  return (
    <motion.div
      data-theme={theme}
      data-vaul-no-drag
      className={`${inDrawer ? "absolute" : "fixed"} inset-0 z-[70] flex items-center justify-center bg-black/40 p-4`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="w-full max-w-[400px] rounded-[24px] bg-background p-6 text-foreground shadow-[0_24px_64px_-16px_rgba(0,0,0,0.45)]"
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={`${id}-title`} className="text-[22px] font-medium leading-tight tracking-[-0.02em]">
            Coming soon
          </h2>
          <CloseX onPress={onClose} />
        </div>

        {status === "sent" ? (
          <p className="mt-3 text-[15px] leading-[1.6] text-foreground/75">Thanks. I'll be in touch.</p>
        ) : (
          <>
            <p className="mt-3 text-[15px] leading-[1.6] text-foreground/75">{entry.comingSoon}</p>
            <form className="mt-5 flex flex-col gap-3" onSubmit={submit}>
              <label htmlFor={`${id}-email`} className="sr-only">
                Email address
              </label>
              <input
                ref={input}
                id={`${id}-email`}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12 rounded-[12px] bg-foreground/[0.06] px-4 text-[16px] text-foreground outline-none placeholder:text-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground/30"
              />
              {/* Hidden from people; bots fill it in, and the server drops those. */}
              <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              <button
                type="submit"
                disabled={status === "sending"}
                className={buttonVariants({
                  size: "lg",
                  className: `${BIG_BUTTON} bg-foreground text-background hover:bg-foreground/85 disabled:opacity-60`,
                })}
              >
                {status === "sending" ? "Sending…" : "Let me know"}
              </button>
              {status === "error" && (
                <p role="alert" className="text-[14px] text-foreground/70">
                  That didn't go through. Try again in a moment.
                </p>
              )}
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
