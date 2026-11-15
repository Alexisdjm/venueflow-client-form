const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const reserved = new Set(["app", "api", "www", "admin", "form"]);

export type SpaIdentity = { slug: string; name: string };

export function spaSlugFromPath(value: string | null | undefined) {
  const slug = value?.trim().toLowerCase();
  if (!slug || reserved.has(slug) || !slugPattern.test(slug)) return null;
  return slug;
}

/**
 * The verification and receipt payloads do not include spaSlug yet.
 * When the API adds it, that field wins. Until then the spa name is the only
 * signal available and a renamed spa can fail closed.
 */
export function bookingMatchesSpa(
  details: { spaSlug?: string | null; spaName: string },
  spa: SpaIdentity,
) {
  if (details.spaSlug) return details.spaSlug === spa.slug;
  return details.spaName.trim() === spa.name.trim();
}
