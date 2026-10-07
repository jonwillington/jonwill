// Who this site is for. Forking it? Start here, then edit content/apps.ts.
// Everything personal that isn't an app lives in this file.

export const SITE = {
  name: "Jon Willington",
  email: "hey@jonwill.ing",
  /** Shown as the domain in links and the lock-screen notification. */
  domain: "jonwill.ing",
  /** Your photo for the Find My widget and the About page: square, ~360px, in /public. */
  photo: "/me.jpg",
  linkedin: {
    url: "https://www.linkedin.com/in/jonathanwillington/",
    label: "linkedin.com/in/jonathanwillington",
  },
  /** The code for this site; shown in the dock. Set to null to hide it. */
  github: "https://github.com/jonwillington/jonwill" as string | null,
  /** WhatsApp in the dock opens a polite "no" instead of a chat. Set to null to hide it. */
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
