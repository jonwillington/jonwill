import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";

import { ABOUT, APPS, WORK, type AppEntry } from "../../content/apps";
import { IconArt } from "../AppIcon";
import { GLASS, GLASS_EDGE } from "./constants";
import { SearchGlyph } from "./Dock";
import { SITE, entryName } from "../../content/site";
import { track } from "../../lib/analytics";
import { plain } from "../../lib/rich";

type Result =
  | { kind: "app"; entry: AppEntry; score: number }
  | { kind: "link"; label: string; detail: string; href: string; entry?: AppEntry; score: number }
  | { kind: "text"; entry: AppEntry; snippet: string; score: number };

const CONTACT = [
  {
    label: `Email ${SITE.name.split(" ")[0]}`,
    detail: SITE.email,
    href: `mailto:${SITE.email}`,
    words: "email mail contact hello hire",
  },
  {
    label: "LinkedIn",
    detail: SITE.linkedin.label,
    href: SITE.linkedin.url,
    words: "linkedin cv career work profile",
  },
];

const norm = (s: string) =>
  s
    .toLocaleLowerCase("en")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

function search(query: string): Result[] {
  const q = norm(query.trim());
  if (!q) return [];
  const words = q.split(/\s+/);
  const hasAll = (text: string) => words.every((w) => norm(text).includes(w));
  const results: Result[] = [];

  for (const entry of [ABOUT, ...(WORK ? [WORK] : []), ...APPS]) {
    const name = norm(entry.id === "about" ? `${SITE.name} about me` : entry.name);
    const meta = [entry.tagline, ...entry.tags].join(" ");
    if (name.startsWith(q)) results.push({ kind: "app", entry, score: 100 });
    else if (hasAll(name)) results.push({ kind: "app", entry, score: 80 });
    else if (hasAll(meta)) results.push({ kind: "app", entry, score: 60 });

    for (const link of entry.links) {
      if (hasAll(`${link.label} ${entry.name}`))
        results.push({ kind: "link", label: link.label, detail: entry.name, href: link.href, entry, score: 40 });
    }
    for (const text of [...entry.body.map(plain), ...(entry.highlights ?? [])]) {
      if (hasAll(text)) results.push({ kind: "text", entry, snippet: text, score: 20 });
    }
  }
  for (const c of CONTACT) {
    if (hasAll(`${c.label} ${c.words}`)) results.push({ kind: "link", ...c, score: 50 });
  }
  return results.sort((a, b) => b.score - a.score);
}

/** Bold every query word inside `text`. */
function Highlight({ text, query }: { text: string; query: string }) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return <>{text}</>;
  const n = norm(text);
  const marks = new Array(text.length).fill(false);
  for (const w of words) {
    let i = n.indexOf(w);
    while (i !== -1) {
      for (let k = i; k < i + w.length; k++) marks[k] = true;
      i = n.indexOf(w, i + w.length);
    }
  }
  const out: ReactNode[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || marks[i] !== marks[start]) {
      const chunk = text.slice(start, i);
      out.push(
        marks[start] ? (
          <b key={start} className="font-semibold text-white">
            {chunk}
          </b>
        ) : (
          chunk
        ),
      );
      start = i;
    }
  }
  return <>{out}</>;
}

export function Spotlight({ onClose, onOpenEntry }: { onClose: () => void; onOpenEntry: (e: AppEntry) => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(query), [query]);

  // What people search for: sent once they pause typing, with how many results it found.
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return;
    const id = window.setTimeout(() => track("search", { search_term: q, results: results.length }), 800);
    return () => window.clearTimeout(id);
  }, [query, results.length]);

  useEffect(() => {
    // Focus after the pill has morphed into the field.
    const id = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 120);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => setActive(0), [query]);

  const run = (r: Result) => {
    track("spotlight_select", {
      query: query.trim().toLowerCase() || undefined,
      kind: r.kind,
      result: r.kind === "link" ? r.label : r.entry.id,
      position: results.indexOf(r) + 1 || undefined,
    });
    onClose();
    if (r.kind === "link") window.open(r.href, r.href.startsWith("http") ? "_blank" : "_self", "noopener");
    else onOpenEntry(r.entry);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  };

  const top = results[0];
  const rest = results.slice(1);
  const groups: [string, Result[]][] = [
    ["Apps", rest.filter((r) => r.kind === "app")],
    ["Links", rest.filter((r) => r.kind === "link")],
    ["On this phone", rest.filter((r) => r.kind === "text")],
  ];
  const indexOf = (r: Result) => results.indexOf(r);

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col"
      // Fades on the way out only: fading in through an ancestor's opacity would hold back the
      // frost below until the end (a flicker), so the frost animates its own blur instead.
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      onKeyDown={onKeyDown}
    >
      {/* The home screen, frosted. */}
      <motion.div
        className="absolute inset-0"
        initial={{ backgroundColor: "rgba(0,0,0,0)", backdropFilter: "blur(0px) saturate(1)" }}
        animate={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(28px) saturate(1.5)" }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        onClick={onClose}
      />

      <div className="relative flex-1 overflow-y-auto px-[16px] pb-[16px] pt-[64px] text-white [scrollbar-width:none]">
        {!query.trim() ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <Heading>Siri Suggestions</Heading>
            <div className="grid grid-cols-4 gap-y-[14px] rounded-[26px] bg-white/10 px-[10px] py-[14px]">
              {[ABOUT, ...APPS].slice(0, 4).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => run({ kind: "app", entry: e, score: 0 })}
                  className="flex cursor-pointer flex-col items-center gap-[6px]"
                >
                  <span className="size-[56px]">
                    <IconArt entry={e} size={56} round={e.id === "about"} />
                  </span>
                  <span className="max-w-[72px] truncate text-[12px] font-medium">
                    {e.id === "about" ? "Jon" : e.name}
                  </span>
                </button>
              ))}
            </div>
            <Heading>Quick actions</Heading>
            <Group>
              {CONTACT.map((c) => (
                <Row key={c.label} onPress={() => run({ kind: "link", ...c, score: 0 })} icon={<LinkGlyph />}>
                  <Title>{c.label}</Title>
                  <Detail>{c.detail}</Detail>
                </Row>
              ))}
            </Group>
          </motion.div>
        ) : results.length === 0 ? (
          <p className="mt-[40px] text-center text-[15px] text-white/60">No results for “{query.trim()}”</p>
        ) : (
          <div>
            <Heading>Top Hit</Heading>
            <Group>
              <ResultRow r={top} query={query} active={active === 0} onPress={() => run(top)} big />
            </Group>
            {groups.map(([title, items]) =>
              items.length ? (
                <div key={title}>
                  <Heading>{title}</Heading>
                  <Group>
                    {items.slice(0, 6).map((r) => (
                      <ResultRow
                        key={`${r.kind}-${indexOf(r)}`}
                        r={r}
                        query={query}
                        active={active === indexOf(r)}
                        onPress={() => run(r)}
                      />
                    ))}
                  </Group>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>

      {/* The Search pill grows into this field (shared layoutId). */}
      <div className="relative flex items-center gap-[10px] px-[16px] pb-[34px] pt-[8px]">
        <motion.label
          layoutId="spotlight-field"
          style={{ borderRadius: 999 }}
          className={`flex h-[48px] flex-1 items-center gap-[8px] px-[16px] text-white ${GLASS} ${GLASS_EDGE}`}
        >
          <span className="opacity-70">
            <SearchGlyph size={17} />
          </span>
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search this phone"
            className="min-w-0 flex-1 bg-transparent text-[17px] tracking-[-0.4px] text-white placeholder:text-white/60 focus:outline-none"
          />
        </motion.label>
        <motion.button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`flex size-[48px] shrink-0 cursor-pointer items-center justify-center rounded-full text-white ${GLASS} ${GLASS_EDGE}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M2 2l10 10M12 2 2 12" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <p className="mb-[8px] mt-[18px] px-[4px] text-[15px] font-semibold tracking-[-0.2px] text-white/90">{children}</p>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-[26px] bg-white/10">{children}</div>;
}

function Row({
  icon,
  onPress,
  active,
  children,
}: {
  icon: ReactNode;
  onPress: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-current={active || undefined}
      onClick={onPress}
      className={`flex w-full cursor-pointer items-center gap-[12px] px-[14px] py-[10px] text-left transition-colors hover:bg-white/10 [&+&]:border-t [&+&]:border-white/10 ${active ? "bg-white/15" : ""}`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

const Title = ({ children }: { children: ReactNode }) => (
  <span className="block truncate text-[16px] font-medium tracking-[-0.3px]">{children}</span>
);
const Detail = ({ children }: { children: ReactNode }) => (
  <span className="line-clamp-2 block text-[13px] leading-[17px] text-white/60">{children}</span>
);

function ResultRow({
  r,
  query,
  active,
  onPress,
  big,
}: {
  r: Result;
  query: string;
  active: boolean;
  onPress: () => void;
  big?: boolean;
}) {
  const size = big ? 48 : 36;
  if (r.kind === "app") {
    return (
      <Row
        active={active}
        onPress={onPress}
        icon={
          <span className="block" style={{ width: size, height: size }}>
            <IconArt entry={r.entry} size={size} round={r.entry.id === "about"} />
          </span>
        }
      >
        <Title>
          <Highlight text={entryName(r.entry)} query={query} />
        </Title>
        <Detail>{r.entry.tagline}</Detail>
      </Row>
    );
  }
  if (r.kind === "link") {
    return (
      <Row active={active} onPress={onPress} icon={<LinkGlyph />}>
        <Title>
          <Highlight text={r.label} query={query} />
        </Title>
        <Detail>{r.detail}</Detail>
      </Row>
    );
  }
  return (
    <Row
      active={active}
      onPress={onPress}
      icon={
        <span className="block size-[36px]">
          <IconArt entry={r.entry} size={36} round={r.entry.id === "about"} />
        </span>
      }
    >
      <Title>{entryName(r.entry)}</Title>
      <Detail>
        <Highlight text={r.snippet} query={query} />
      </Detail>
    </Row>
  );
}

function LinkGlyph() {
  return (
    <span className="flex size-[36px] items-center justify-center rounded-full bg-white/15">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
        <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
      </svg>
    </span>
  );
}
