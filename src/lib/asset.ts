/**
 * A file in /public, wherever the site is served from. Paths in the content are written
 * from the root ("/me.jpg"); on a sub-path deploy (GitHub Pages serves /<repo>/) they
 * need the base in front. External URLs pass through untouched.
 */
export const asset = (path: string) => (path.startsWith("/") ? `${import.meta.env.BASE_URL}${path.slice(1)}` : path);
