const LAST_PROJECT_KEY = "pulseguard_last_project_slug";

export function getLastProjectSlug(): string | null {
  if (typeof window === "undefined") return null;
  const slug = window.localStorage.getItem(LAST_PROJECT_KEY);
  return slug && slug.length > 0 ? slug : null;
}

export function setLastProjectSlug(slug: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_PROJECT_KEY, slug);
}

export function clearLastProjectSlug(slug?: string) {
  if (typeof window === "undefined") return;
  if (!slug || getLastProjectSlug() === slug) {
    window.localStorage.removeItem(LAST_PROJECT_KEY);
  }
}

export function getPostAuthPath(): string {
  const slug = getLastProjectSlug();
  return slug ? `/projects/${slug}` : "/projects";
}
