// Who this site is for. Forking it? Start here, then edit content/apps.ts.
// Everything personal that isn't an app lives in this file.

export const SITE = {
  name: "Your Name",
  firstName: "Your",
  /** Your job, shown on the phone's contact card and in the vCard it shares. */
  role: "Product Designer",
  company: { name: "Your Company", url: "https://example.com" },
  /** The About page's words: the line under "Welcome!" (empty for none) and the paragraph below it. */
  about: {
    tagline: "Make yourself at home.",
    body: ["A line or two about you and what's on this phone."],
  },
  /** The one-line summary link previews show (Open Graph, search results). */
  description: "A personal site that's an iPhone: the apps I've made, one tap away.",
  email: "you@example.com",
  /** Shown as the domain in links and the lock-screen notification. */
  domain: "example.com",
  /** Your photo for the Find My widget and the About page: square, ~360px, in /public. */
  photo: "/me.jpg",
  linkedin: {
    url: "https://www.linkedin.com/in/your-profile/",
    label: "linkedin.com/in/your-profile",
  },
  /** Google Analytics 4 measurement ID. Only loaded in production builds; null to turn it off. */
  googleAnalytics: null as string | null,
  /** The code for this site; shown in the dock. Set to null to hide it. */
  github: "https://github.com/jonwillington/jonwill" as string | null,
  /** Call and FaceTime on the phone's contact card show this polite "no" instead. Null to skip it. */
  whatsapp: {
    title: "I'm not that crazy",
    message: "My number stays off the internet. Send me an email and I'll get back to you.",
  } as { title: string; message: string } | null,
  /**
   * Where you are. Drives the phone's clock, the "Auto" dark mode (sunset here),
   * and the Find My widget.
   */
  city: {
    name: "Istanbul",
    /** The country, and its ISO code for the little chip on the contact card. */
    country: { name: "Türkiye", code: "TR" },
    timeZone: "Europe/Istanbul",
    lat: 41.01,
    lon: 28.98,
    /** Static map renders, 1092×510, light and dark (see README: "Your map"). */
    map: { light: "/istanbul-map.jpg", dark: "/istanbul-map-dark.jpg" },
    /** Where the photo pin sits on the map, as percentages of the widget. */
    pin: { left: "37%", top: "44%" },
  },
};

/** The display name for an entry: the About entry is you. */
export const entryName = (e: { id: string; name: string }) => (e.id === "about" ? SITE.name : e.name);
