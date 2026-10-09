import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { ABOUT, APPS } from "../../content/apps";
import { SITE } from "../../content/site";
import { track } from "../../lib/analytics";
import { plain } from "../../lib/rich";
import { formatTime, useNow } from "../../lib/time";
import { IconArt } from "../AppIcon";
import { IOSAlert } from "./IOSAlert";

/**
 * The phone's own glass: translucent white, a bright top rim and a faint edge, as on the
 * iOS 26 Phone app. `TINT` is the violet the action buttons pick up from the backdrop.
 */
const GLASS =
  "bg-white/[0.12] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(255,255,255,0.14)]";
const TINT =
  "bg-[rgba(120,95,190,0.28)] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_0_0_1px_rgba(170,150,255,0.45)]";
const CARD = "overflow-hidden rounded-[26px] bg-white/[0.08] backdrop-blur-xl";

/** Grey-blue up top, where the status bar is dark, into a deep violet night. */
const BACKDROP =
  "linear-gradient(180deg, #9ba6ac 0%, #8a8b9e 22%, #5f5680 42%, #2c2347 60%, #171129 78%, #0e0a1a 100%)";

/** The name moves into the nav bar once it scrolls under it. */
const TITLE_AT = 380;

type Tab = "details" | "apps";

/**
 * The About page on the phone: your contact, as the iOS 26 Phone app shows one. Big round
 * photo, name, four round actions, a Details / Apps switch and the cards under it.
 */
export function ContactCard({ onBack }: { onBack: () => void }) {
  const time = formatTime(useNow());
  const [tab, setTab] = useState<Tab>("details");
  const [scrolled, setScrolled] = useState(false);
  const [alert, setAlert] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Call and FaceTime: the same polite "no" as WhatsApp in the dock.
  const noNumber = () => {
    track("contact_card_call", {});
    setAlert(true);
  };

  const actions = [
    { label: "Message", href: SITE.linkedin.url, icon: <MessageIcon /> },
    { label: "Call", onPress: noNumber, icon: <PhoneIcon /> },
    { label: "FaceTime", onPress: noNumber, icon: <VideoIcon /> },
    { label: "Mail", href: `mailto:${SITE.email}`, icon: <MailIcon /> },
  ];

  return (
    <div className="relative size-full overflow-hidden text-white" style={{ background: BACKDROP }}>
      <div
        ref={scroller}
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > TITLE_AT)}
        className="size-full overflow-y-auto overscroll-contain pb-[120px] pt-[108px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* The photo, in a glass ring. */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 24 }}
          className="mx-auto size-[188px] rounded-full p-[3px] shadow-[0_10px_40px_rgba(20,10,50,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] ring-1 ring-white/25"
        >
          <img src={SITE.photo} alt={SITE.name} draggable={false} className="size-full rounded-full object-cover" />
        </motion.div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[15px] text-white/85">
          Currently in:
          <span className="rounded-[4px] bg-white/90 px-1 text-[10px] font-bold leading-[14px] text-[#2c2347]">
            {SITE.city.country.code}
          </span>
          {SITE.city.name}
          <span className="text-white/60">· {time}</span>
        </p>

        <h2 className="mt-2 text-center text-[36px] font-bold leading-tight tracking-[-0.8px]">{SITE.name}</h2>

        <div className="mt-4 flex justify-center gap-3">
          {actions.map((a) => {
            const className = `${TINT} flex size-16 items-center justify-center rounded-full transition-transform active:scale-95`;
            return a.href ? (
              <a
                key={a.label}
                href={a.href}
                target={a.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={a.label}
                className={className}
              >
                {a.icon}
              </a>
            ) : (
              <button key={a.label} type="button" aria-label={a.label} onClick={a.onPress} className={className}>
                {a.icon}
              </button>
            );
          })}
        </div>

        {/* Details / Apps, like Details / Voicemails. */}
        <div className={`${GLASS} relative mx-auto mt-6 flex h-[46px] w-[188px] items-center rounded-full p-[3px]`}>
          {(["details", "apps"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                track("contact_card_tab", { tab: t });
              }}
              className="relative z-10 h-full flex-1 cursor-pointer rounded-full text-[15px] capitalize"
            >
              {tab === t && (
                <motion.span
                  layoutId="contact-tab"
                  className="absolute inset-0 -z-10 rounded-full bg-white/[0.18]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 px-4">
          {tab === "details" ? (
            <>
              <div className={CARD}>
                <Row label="email" value={SITE.email} href={`mailto:${SITE.email}`} icon={<MailIcon small />} />
                <Row label="LinkedIn" value={SITE.linkedin.label} href={SITE.linkedin.url} icon={<Chevron />} />
                <Row
                  label="work"
                  value={`${SITE.role}, ${SITE.company.name}`}
                  href={SITE.company.url}
                  icon={<Chevron />}
                />
              </div>

              <div className={CARD}>
                <div className="px-5 pb-3 pt-4">
                  <p className="text-[15px] text-white/90">currently in</p>
                  <p className="text-[17px]">{SITE.city.name}, {SITE.city.country.name}</p>
                </div>
                <div className="relative mx-4 mb-4 aspect-[1092/510] overflow-hidden rounded-[16px]">
                  <img src={SITE.city.map.dark} alt={`Map of ${SITE.city.name}`} draggable={false} className="size-full object-cover" />
                  <span
                    className="absolute -translate-x-1/2 -translate-y-full"
                    style={{ left: SITE.city.pin.left, top: SITE.city.pin.top }}
                  >
                    <span className="location-pulse absolute bottom-[-10px] left-1/2 size-[36px] -translate-x-1/2 rounded-full bg-[#0a84ff]/30" />
                    <span className="relative block size-[38px] overflow-hidden rounded-full border-[3px] border-white shadow-[0_3px_10px_rgba(0,0,0,0.45)]">
                      <img src={SITE.photo} alt="" draggable={false} className="size-full object-cover" />
                    </span>
                  </span>
                  <span className="absolute bottom-1 right-2 text-[7px] text-white/60">© OpenStreetMap</span>
                </div>
              </div>

              <div className={CARD}>
                <div className="px-5 py-4">
                  <p className="text-[15px] text-white/90">Notes</p>
                  <p className="mt-1 text-[16px] leading-[1.45] text-white/80">{plain(ABOUT.body[0])}</p>
                </div>
              </div>

              <div className={CARD}>
                <button
                  type="button"
                  onClick={shareContact}
                  className="block w-full cursor-pointer px-5 py-4 text-left text-[17px] transition-colors hover:bg-white/[0.05]"
                >
                  Share Contact
                </button>
              </div>
            </>
          ) : (
            <div className={CARD}>
              {APPS.map((app) => (
                <a
                  key={app.id}
                  href={app.links[0]?.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.05] [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/10"
                >
                  <span className="size-10 shrink-0">
                    <IconArt entry={app} size={40} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px]">{app.name}</span>
                    <span className="block truncate text-[13px] text-white/60">{app.tagline}</span>
                  </span>
                  <Chevron />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* The nav bar: back (closes to the home screen), Edit, and the name once it has scrolled up under them. */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[112px] transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "linear-gradient(to bottom, rgba(155,166,172,0.95) 55%, rgba(155,166,172,0))" }}
      />
      <div className="absolute inset-x-4 top-[62px] flex items-center justify-between">
        <button
          type="button"
          aria-label="Back to the home screen"
          onClick={onBack}
          className={`${GLASS} flex size-11 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95`}
        >
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 2 2 10l8 8" />
          </svg>
        </button>
        <AnimatePresence>
          {scrolled && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="text-[20px] font-bold tracking-[-0.4px]"
            >
              {SITE.name}
            </motion.span>
          )}
        </AnimatePresence>
        <span aria-hidden className={`${GLASS} flex h-11 items-center rounded-full px-4 text-[17px]`}>
          Edit
        </span>
      </div>

      {/* The Phone app's tab bar, on Contacts. Decorative. */}
      <div aria-hidden className="absolute inset-x-[20px] bottom-[22px] flex h-[62px] items-center justify-around rounded-full bg-[rgba(30,24,50,0.72)] px-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-xl">
        {TABS.map(({ label, icon }) => (
          <span
            key={label}
            className={`flex h-[54px] flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-medium ${
              label === "Contacts" ? "bg-white/[0.12] text-[#4aa3ff]" : "text-white/90"
            }`}
          >
            {icon}
            {label}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {alert && SITE.whatsapp && (
          <IOSAlert
            title={SITE.whatsapp.title}
            message={SITE.whatsapp.message}
            actions={[
              { label: "Cancel" },
              { label: "Email", primary: true, href: `mailto:${SITE.email}` },
            ]}
            onClose={() => setAlert(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Downloads a vCard, so "Share Contact" puts you straight into someone's contacts. */
function shareContact() {
  track("contact_card_share", {});
  const [first, ...rest] = SITE.name.split(" ");
  const card = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${rest.join(" ")};${first};;;`,
    `FN:${SITE.name}`,
    `ORG:${SITE.company.name}`,
    `TITLE:${SITE.role}`,
    `EMAIL;TYPE=INTERNET:${SITE.email}`,
    `URL:https://${SITE.domain}`,
    `URL:${SITE.linkedin.url}`,
    `ADR;TYPE=HOME:;;;${SITE.city.name};;;${SITE.city.country.name}`,
    "END:VCARD",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([card], { type: "text/vcard" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${SITE.name}.vcf` });
  a.click();
  URL.revokeObjectURL(url);
}

function Row({ label, value, href, icon }: { label: string; value: string; href: string; icon: ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.05] [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/10"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] text-white/90">{label}</span>
        <span className="block truncate text-[17px]">{value}</span>
      </span>
      <span className="shrink-0 text-white/80">{icon}</span>
    </a>
  );
}

const TABS = [
  {
    label: "Favourites",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
      </svg>
    ),
  },
  {
    label: "Recents",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5h-3.5" />
      </svg>
    ),
  },
  {
    label: "Contacts",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 13.5a8 8 0 0 1-6.1-2.8c1.1-1.7 3.4-2.7 6.1-2.7s5 1 6.1 2.7A8 8 0 0 1 12 20Z" />
      </svg>
    ),
  },
  {
    label: "Keypad",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        {[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.4" />))}
      </svg>
    ),
  },
  {
    label: "Voicemail",
    icon: (
      <svg width="28" height="24" viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="7.5" cy="12" r="4.5" />
        <circle cx="20.5" cy="12" r="4.5" />
        <path d="M7.5 16.5h13" />
      </svg>
    ),
  },
];

function MessageIcon() {
  return (
    <svg width="28" height="26" viewBox="0 0 28 26" fill="currentColor" aria-hidden>
      <path d="M14 2C7.1 2 1.5 6.5 1.5 12c0 3.1 1.8 5.9 4.6 7.7-.3 1.6-1.2 3.2-2.6 4.3 2.9.1 5.4-1 7-2.5 1.1.3 2.3.5 3.5.5 6.9 0 12.5-4.5 12.5-10S20.9 2 14 2Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.6 2.2c.6-.2 1.3 0 1.7.5l2.3 3.1c.4.6.4 1.4-.1 1.9L9 9.3c1.2 2.4 3.3 4.5 5.7 5.7l1.6-1.5c.5-.5 1.3-.6 1.9-.1l3.1 2.3c.5.4.7 1.1.5 1.7l-.7 2.1c-.3.9-1.2 1.5-2.2 1.4C10.6 20.3 3.7 13.4 3.1 5.1 3 4.1 3.6 3.2 4.5 2.9l2.1-.7Z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="30" height="20" viewBox="0 0 30 20" fill="currentColor" aria-hidden>
      <rect x="1" y="2" width="19" height="16" rx="4" />
      <path d="m22 8 6-4v12l-6-4z" />
    </svg>
  );
}

function MailIcon({ small = false }: { small?: boolean }) {
  return (
    <svg width={small ? 20 : 30} height={small ? 15 : 22} viewBox="0 0 30 22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className={small ? "" : "opacity-80"}>
      <rect x="1.5" y="1.5" width="27" height="19" rx="3" />
      <path d="m2 2.5 13 10 13-10M2 19.5l9.5-8.5M28 19.5 18.5 11" strokeLinejoin="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="9" height="15" viewBox="0 0 9 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-white/60">
      <path d="m1.5 1.5 6 6-6 6" />
    </svg>
  );
}
