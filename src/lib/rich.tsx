import { Fragment } from "react";

/** Copy can carry inline links as [text](url); everything else is plain text. */
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** A paragraph of copy, with its [text](url) links made clickable. */
export function Rich({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    const external = href.startsWith("http");
    parts.push(
      <a
        key={m.index}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="underline decoration-foreground/30 underline-offset-[3px] transition-colors hover:decoration-foreground"
      >
        {label}
      </a>,
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <Fragment>{parts}</Fragment>;
}

/** The same copy with the link markup stripped, for search and anywhere plain text goes. */
export const plain = (text: string) => text.replace(LINK, "$1");
