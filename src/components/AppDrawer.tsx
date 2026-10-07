import { useEffect, useState } from "react";
import { Drawer } from "vaul";

import type { AppEntry } from "../content/apps";
import { IconArt } from "./AppIcon";
import { CloseX } from "./CloseX";
import { AppStoreBadge, EYEBROW, LinkButton, Tags } from "./DetailPanel";
import { entryName } from "../content/site";

/**
 * "Learn more": a Vaul side drawer with everything that doesn't fit in the
 * panel. Swipe it back to the right to close; the page scales back behind it
 * (see data-vaul-drawer-wrapper in App).
 */
export function AppDrawer({
  entry,
  open,
  onOpenChange,
  dark,
  background,
}: {
  entry: AppEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  /** The sheet's colour: the page's, so it feels like part of the app. */
  background: string;
}) {
  const scheme = dark ? "dark" : (entry?.scheme ?? "dark");
  // Once the article scrolls, the pinned header gets a hairline and a softer shadow underneath.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setScrolled(false), [entry?.id, open]);

  return (
    <Drawer.Root direction="right" open={open && !!entry} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content
          data-theme={scheme}
          aria-describedby={undefined}
          className="fixed bottom-2 right-2 top-2 z-50 flex w-[min(560px,calc(100vw-16px))] flex-col overflow-hidden rounded-[28px] text-foreground shadow-[-12px_0_48px_rgba(0,0,0,0.22)] outline-none"
          style={{ background }}
        >
          {entry && (
            <div
              className="overflow-y-auto px-7 pb-10 text-[15px] leading-[1.6]"
              onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
            >
              {/* Pinned while the article scrolls underneath; it shrinks to a compact bar once scrolled. */}
              <header
                className={`sticky top-0 z-10 -mx-7 flex items-center justify-between gap-4 px-7 transition-[padding,box-shadow] duration-200 ${
                  scrolled ? "py-3 shadow-[0_1px_0_rgba(0,0,0,0.08),0_8px_16px_-12px_rgba(0,0,0,0.25)]" : "pb-4 pt-7"
                }`}
                style={{ background }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`shrink-0 transition-[width,height] duration-200 [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.10))] ${scrolled ? "size-8" : "size-12"}`}
                  >
                    <IconArt entry={entry} size={scrolled ? 32 : 48} round={entry.id === "about"} />
                  </div>
                  <div className="min-w-0">
                    <Drawer.Title
                      className={`truncate font-semibold leading-tight tracking-[-0.02em] transition-[font-size] duration-200 ${scrolled ? "text-[16px]" : "text-[19px]"}`}
                    >
                      {entryName(entry)}
                    </Drawer.Title>
                    {!scrolled && <p className="truncate text-[14px] text-foreground/65">{entry.tagline}</p>}
                  </div>
                </div>
                <CloseX onPress={() => onOpenChange(false)} />
              </header>

              {entry.highlights && (
                <section className="mt-3 rounded-[14px] bg-foreground/[0.04] px-5 py-4" aria-label="At a glance">
                  <p className={`mb-2 ${EYEBROW}`}>At a glance</p>
                  <ul className="flex flex-col gap-1.5">
                    {entry.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5">
                        <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-foreground/45" aria-hidden />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* The long read: the same sections, in the same order, for every app. */}
              <article className="mt-8 flex max-w-[62ch] flex-col gap-8 text-[16px] leading-[1.7]">
                {(entry.article ?? [{ title: "What is it?", body: entry.body }]).map((section) => (
                  <section key={section.title}>
                    <h3 className="mb-2 text-[19px] font-semibold leading-snug tracking-[-0.015em]">{section.title}</h3>
                    <div className="flex flex-col gap-3 text-foreground/85">
                      {section.body.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </article>

              <section className="mt-8">
                <p className={`mb-2 ${EYEBROW}`}>Built with</p>
                <Tags tags={entry.tags} />
              </section>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                {entry.links.map((l, i) => (
                  <LinkButton key={l.href} link={l} primary={i === 0} />
                ))}
                {entry.appStore && <AppStoreBadge href={entry.appStore} />}
              </div>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
