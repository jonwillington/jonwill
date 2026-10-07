import { useEffect, useState } from "react";

// Dev-only: flick through the typefaces in public/fonts/<Family>/ on the page's
// headings (or all its text). [ and ] step through them; the choice is remembered.
// Rendered only under `npm run dev` (see main.tsx), so it never ships.

type Family = { family: string; files: string[] };

const KEY = "jonwill:font-picker";
const SYSTEM = "System";

/** Guess a file's weight and style from its name, e.g. "Basier-SemiBoldItalic.otf". */
function describe(file: string) {
  const name = file.split("/").pop()!.toLowerCase();
  const weights: [RegExp, number][] = [
    [/hairline|thin/, 100],
    [/extra-?light|ultra-?light/, 200],
    [/light/, 300],
    [/semi-?bold|demi/, 600],
    [/extra-?bold|ultra-?bold/, 800],
    [/black|heavy/, 900],
    [/bold/, 700],
    [/medium/, 500],
  ];
  const weight = weights.find(([re]) => re.test(name))?.[1] ?? 400;
  const style = /italic|oblique/.test(name) ? "italic" : "normal";
  return { weight: String(weight), style };
}

async function load(f: Family) {
  const loaded = await Promise.all(
    f.files.map(async (url) => {
      const { weight, style } = describe(url);
      const face = new FontFace(`picker-${f.family}`, `url("${url}")`, { weight, style });
      try {
        await face.load();
        document.fonts.add(face);
        return true;
      } catch {
        return false;
      }
    }),
  );
  return loaded.some(Boolean);
}

export function FontPicker() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [index, setIndex] = useState(-1); // -1 = the site's own font
  const [scope, setScope] = useState<"headings" | "all">("headings");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    fetch("/__fonts")
      .then((r) => r.json() as Promise<Family[]>)
      .then((list) => {
        setFamilies(list);
        try {
          const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
          const i = list.findIndex((f) => f.family === saved.family);
          if (i > -1) setIndex(i);
          if (saved.scope) setScope(saved.scope);
        } catch {
          // Nothing saved.
        }
      })
      .catch(() => {});
  }, []);

  const current = index > -1 ? families[index] : null;

  useEffect(() => {
    const root = document.documentElement;
    if (!current) {
      root.style.removeProperty("--font-heading");
      root.style.removeProperty("--font-sans-override");
    } else {
      load(current);
      const stack = `"picker-${current.family}", var(--font-system)`;
      root.style.setProperty("--font-heading", stack);
      if (scope === "all") root.style.setProperty("--font-sans-override", stack);
      else root.style.removeProperty("--font-sans-override");
    }
    try {
      localStorage.setItem(KEY, JSON.stringify({ family: current?.family, scope }));
    } catch {
      // Not remembered.
    }
  }, [current, scope]);

  const step = (d: number) => setIndex((i) => ((i + 1 + d + families.length + 1) % (families.length + 1)) - 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key === "]") step(1);
      if (e.key === "[") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-3 left-3 z-[100] cursor-pointer rounded-full bg-black/80 px-3 py-1.5 font-mono text-[11px] text-white"
      >
        Aa
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 left-3 z-[100] flex w-[280px] flex-col gap-2 rounded-2xl bg-black/85 p-3 font-mono text-[11px] text-white shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-[0.08em] text-white/50">Fonts · [ ]</span>
        <button type="button" onClick={() => setOpen(false)} className="cursor-pointer text-white/50 hover:text-white">
          hide
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => step(-1)} className="cursor-pointer rounded bg-white/10 px-2 py-1">
          ‹
        </button>
        <select
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="min-w-0 flex-1 rounded bg-white/10 px-2 py-1 text-white outline-none"
        >
          <option value={-1}>{SYSTEM} (site default)</option>
          {families.map((f, i) => (
            <option key={f.family} value={i}>
              {f.family} ({f.files.length})
            </option>
          ))}
        </select>
        <button type="button" onClick={() => step(1)} className="cursor-pointer rounded bg-white/10 px-2 py-1">
          ›
        </button>
      </div>
      <div className="flex gap-1">
        {(["headings", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScope(s)}
            className={`flex-1 cursor-pointer rounded px-2 py-1 ${scope === s ? "bg-white text-black" : "bg-white/10"}`}
          >
            {s === "headings" ? "Headings" : "All text"}
          </button>
        ))}
      </div>
      {families.length === 0 && (
        <p className="leading-relaxed text-white/60">Add folders of .otf/.woff2 files to public/fonts/&lt;Family&gt;/.</p>
      )}
    </div>
  );
}
