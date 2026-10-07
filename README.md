# jonwill.ing

A personal site that's an iPhone. Visitors land on a lock screen, swipe up to a
home screen of the apps I've made, and tap one to open it: the phone plays the
real app, and a panel beside it explains what it is, with live data and a
long-form write-up in a drawer.

**Live:** [jonwill.ing](https://jonwill.ing)

It's built to be forked. Everything personal is in two files, so you can turn it
into your own phone without touching the components.

## What's in it

- **A photoreal iPhone 17**, laid out to the point with real iOS 26 metrics
  (icon grid, dock, widgets, continuous "squircle" corners).
- **Lock screen** with notifications that can be fed from live APIs. Swipe up,
  click or press Enter to unlock.
- **Home screen:** a Find My-style widget with your photo pinned on a map of your
  city, app icons with notification badges until visited, the dock, and a
  Search pill.
- **Apps open into real screens:** screenshots that page like a navigation stack,
  or screen recordings that play inside the phone.
- **iOS behaviour:** long-press menus, edit mode with drag-to-rearrange
  (remembered per visitor), swipe up to close, Spotlight (⌘K), a Dynamic Island
  Live Activity, iOS-style alerts, ⌘Z "Undo Typing".
- **The page around the phone** takes on each app's colour, with a summary panel,
  rich data blocks (a market grid, a list of sister sites, a ranked table) and a
  "Learn more" side drawer with an article in a fixed shape:
  *What is it? · Why I made it · How I built it · What's next*.
- **Light / Auto / Dark**, where Auto follows sunset in your city.
- **On a phone** there's no frame: the page is the home screen.

Built with React 19, Vite, Tailwind 4, HeroUI v3, Motion, Vaul and
`figma-squircle`. Hosted on Cloudflare Pages, with one Pages Function for live
data.

## Make it yours

```bash
git clone https://github.com/jonwillington/jonwill my-phone
cd my-phone
npm install
npm run dev
```

Then work through this list.

### 1. You: `src/content/site.ts`

Your name, email, domain, LinkedIn, GitHub, photo and city, and your Google Analytics ID
(see [Analytics](#analytics-google-analytics-4) below). The city sets the
phone's clock, when Auto dark mode switches, and the Find My widget. Set
`whatsapp` or `github` to `null` to drop them from the dock.

Replace `public/me.jpg` with a square photo of you (about 360px).

### Analytics (Google Analytics 4)

Put your GA4 measurement ID in `src/content/site.ts`:

```ts
googleAnalytics: "G-XXXXXXXXXX", // or null for no analytics
```

You'll find the ID in Google Analytics under **Admin → Data streams → (your web stream) →
Measurement ID**. That's all: no snippet to paste into `index.html`. It only loads in production
builds (`npm run build` / `npm run deploy`), so local development never pollutes your stats.

Every app a visitor opens is counted as its own page view (`/ton#<app>`), and the site sends
these events. In GA they appear under **Reports → Engagement → Events**; to filter or chart by a
parameter (for example which app, or how it was opened), register it under **Admin → Custom
definitions → Create custom dimension** with the parameter name below.

| Event | When | Parameters |
| --- | --- | --- |
| `unlock` | The lock screen is dismissed | `method` (swipe, click, keyboard, notification), `app` |
| `app_open` | An app opens | `app`, `source` (icon, widget, notification, switcher, spotlight, live_activity, deep_link, hash), `first_time` |
| `app_close` | An app closes | `app`, `method` (close_button, escape, home_indicator, switched_app), `seconds_open` |
| `app_screen` | The screen inside an app changes | `app`, `screen`, `method` (auto, tap, swipe, dots, video_end) |
| `video_complete` | A screen recording plays to the end | `app`, `video` |
| `learn_more` / `learn_more_close` | The drawer opens / closes | `app` |
| `article_read` | The drawer closes | `app`, `depth_pct` (0–100 in 25s), `seconds` |
| `outbound_click` / `email_click` | Any link off the site | `link_url`, `link_domain`, `link_text`, `area` (panel, drawer, footer, phone, market_grid, network, destinations, app_store_badge, …), `app` |
| `context_menu_trigger` | An app icon is held or right-clicked | `app`, `trigger` |
| `context_menu_open` / `context_menu_action` | A long-press menu opens / an item is chosen | `target`, `action` |
| `spotlight_open` | Spotlight opens | `trigger` (search_pill, cmd_k, slash) |
| `search` | A Spotlight search (after a pause in typing) | `search_term`, `results` |
| `spotlight_select` | A Spotlight result is chosen | `query`, `kind`, `result`, `position` |
| `alert_shown` / `alert_action` | An iOS alert appears / a button is pressed | `alert` (whatsapp, template_offer, undo_typing, remove_…), `action` |
| `edit_mode`, `icon_reorder` | Edit mode starts / an icon is moved | `source` / `app`, `position` |
| `dock_tap`, `copy`, `share` | WhatsApp in the dock, copy actions, sharing an app | `app` / `what` / `method` |
| `theme_change` | Light / Auto / Dark | `mode`, `from` |
| `live_activity_shown`, `live_activity_tap` | The Dynamic Island timer | `action` |
| `lock_screen_control` | Flashlight or camera on the lock screen | `control`, `on` |
| `undo_typing` | ⌘Z or a shake | `trigger` |

To check events while developing, run `localStorage.setItem("jonwill:debug-analytics", "1")`
in the browser console and reload: `npm run dev` then logs every event to the console instead of
sending it. Add `data-track="your-name"` to any element to label the links inside it in
`outbound_click`.

GA sets cookies, so in the UK and EU you'll normally want a consent prompt before it loads.

### 2. Your apps: `src/content/apps.ts`

One entry per icon. Each has:

| Field | What it does |
| --- | --- |
| `id`, `name`, `icon` | The icon on the home screen (512px image in `public/icons`). |
| `accent`, `scheme`, `glow` | The page colour when the app is open (use the icon's background colour), whether text on it is dark or light, and an optional coloured glow. |
| `tagline`, `tags`, `body` | The summary panel: one line, a few mono tags, one sentence. |
| `links` | Buttons. The first is the main one. |
| `appStore` | Your app's App Store URL: adds Apple's "Download on the App Store" badge. |
| `screens` | What plays in the phone: screenshots (804×1748 webp) or `.mp4` clips with `captions`. Optional `dark` screenshots for dark mode. |
| `article` | The drawer's long read. Keep the same section titles across apps. |
| `highlights` | "At a glance" bullets in the drawer. |
| `markets`, `network`, `destinations` | Optional rich data blocks for the panel. Use whichever fits, or none. |

`ABOUT` is you; it opens from the Find My widget. Everything else goes in `APPS`.

### 3. Your map

The Find My widget uses two static map images. Render your own city:

```bash
node scripts/render-map.mjs --lat 51.507 --lon -0.128 --zoom 11.3 --name london-map
```

This writes `public/london-map.jpg` and `public/london-map-dark.jpg` (needs
Chrome). Point `SITE.city.map` at them and move `SITE.city.pin` so the pin sits
where you live. The map data is © OpenStreetMap contributors, via OpenFreeMap;
keep the attribution on the widget.

### 4. Screens

Screenshots from the iOS Simulator are already the right shape. Resize them to
804×1748 and save as webp. For screen recordings, a 4:5 crop works best: they
show as a card with a caption under it. Keep them small (under 2MB):

```bash
ffmpeg -i in.mov -an -vf "scale=804:-2,fps=30" -c:v libx264 -crf 27 -pix_fmt yuv420p -movflags +faststart out.mp4
```

### 5. Live data (optional)

`functions/api/live.ts` is a Cloudflare Pages Function that feeds the lock-screen
notifications, the header strip and some panel counts. It's wired to my APIs
(ddbx and the Filter coffee API). Swap in your own, or delete the function. The
site works without it, and the live bits just don't appear.

Run it locally with `npm run dev:full` (builds, then serves with Wrangler).

## Keep or change

**Please keep:**

- The OpenStreetMap attribution on the map widget.
- The licence notices for the third-party pieces below.

**Please change** (they're mine, not part of the template):

- `public/me.jpg`, `public/screens`, `public/videos` and my app icons.
- The copy in `src/content/apps.ts` and `src/content/site.ts`.
- Anything branded to someone else: the Deel, LinkedIn, WhatsApp, Mail and GitHub
  icons are their owners' trademarks. Use your own, or fetch your apps' icons from
  the App Store.

**Your call:**

- The iPhone bezel in `public/device` comes from Apple's marketing resources and
  is not covered by this repo's licence. Download it from
  [Apple Design Resources](https://developer.apple.com/design/resources/) yourself
  and check Apple's terms, or swap in a different frame. The screen sits at
  (24, 23)pt in a 450×920pt device; see `src/components/phone/constants.ts`.

## Typeface

Headings use [General Sans](https://www.fontshare.com/fonts/general-sans) at weight 500, loaded
from Fontshare in `index.html` (free for commercial use); change `--font-heading` in
`src/globals.css` to swap it. The rest of the page around the phone is set in [PP Neue Montreal](https://pangrampangram.com/products/neue-montreal)
when its font files are in `public/fonts/neue-montreal/` (Book, Medium, Bold, Italic as `.otf`).
That folder is git-ignored and `npm run deploy` strips it, because the free licence doesn't
allow use on a website. Without the files, everything falls back to the system font. To ship
it, buy a web licence, add the files and remove the `rm -rf dist/fonts` from the deploy
script. The phone always uses the system font, as iOS does.

### Trying other typefaces

In `npm run dev` there's a font picker in the bottom-left corner. Put each typeface in its
own folder under `public/fonts/` (e.g. `public/fonts/Basier/*.otf`); the picker finds them,
and `[` / `]` step through them on the headings or on all text. It never ships.

`node scripts/fetch-fontshare.mjs` fills the picker with every [Fontshare](https://www.fontshare.com)
family (free for commercial and web use) in three weights; add a category such as `Serif` to
fetch just those.

## Deploy

```bash
npm run deploy   # builds and deploys to Cloudflare Pages (project "jonwill")
```

Change the project name in `package.json` and `wrangler.toml`. `/` redirects to
`/ton` (a play on Willing-ton); edit `public/_redirects` and the build script if
you'd rather serve from the root.

## Layout

```
src/
  content/site.ts        you
  content/apps.ts        your apps (the mini CMS)
  App.tsx                the page: phone, panel, drawer, header and footer
  components/Phone.tsx   the device and everything on its screen
  components/phone/      lock screen, widgets, dock, Spotlight, menus, alerts, island
  components/DetailPanel.tsx, AppDrawer.tsx
  lib/squircle.tsx       iOS continuous corners, fitted to a real iPhone
functions/api/live.ts    optional live data
scripts/                 map rendering
```

## Licence

The code is MIT; see [LICENSE](LICENSE). Images, videos, icons and copy are not
covered; see [NOTICE.md](NOTICE.md).
