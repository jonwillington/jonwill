/**
 * A file in /public, wherever the site is served from. Paths in the content are written
 * from the root ("/me.jpg"); on a sub-path deploy (GitHub Pages serves /<repo>/) they
 * need the base in front. External URLs pass through untouched.
 *
 * Each build stamps its files with ?v=<build>: browsers keep /public files for hours, so a
 * screenshot replaced under the same name would otherwise show the old one until then.
 */
export const asset = (path: string) =>
  path.startsWith("/") ? `${import.meta.env.BASE_URL}${path.slice(1)}?v=${__BUILD__}` : path;
