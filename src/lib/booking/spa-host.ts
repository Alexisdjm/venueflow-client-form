const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const reserved = new Set(["app", "api", "www", "admin"]);

export type SpaIdentity = { slug: string; name: string };

/** Parent domains allowed to carry a spa subdomain. Explicit per environment; no implicit fallback. */
export function bookingHostSuffixes(raw = process.env.BOOKING_HOST_SUFFIXES) {
  return (raw ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase().replace(/^\./, "").replace(/\.$/, ""))
    .filter(Boolean);
}

function hostnameOf(hostHeader: string) {
  const value = hostHeader.trim().toLowerCase().replace(/\.$/, "");
  if (!value || value.startsWith("[")) return null;
  const port = value.match(/^(.*):(\d+)$/);
  return port ? port[1] : value;
}

/**
 * Reads only the Host header. Forwarded or custom tenant headers are ignored:
 * the browser can send those, and they are not proof of the spa.
 */
export function spaSlugFromRequestHeaders(
  source: { get(name: string): string | null },
  suffixes: readonly string[],
) {
  return spaSlugFromHost(source.get("host"), suffixes);
}

export function spaSlugFromHost(hostHeader: string | null | undefined, suffixes: readonly string[]) {
  if (!hostHeader) return null;
  const host = hostnameOf(hostHeader);
  if (!host || host.includes("..")) return null;
  const parents = [...suffixes]
    .map((item) => item.trim().toLowerCase().replace(/^\./, "").replace(/\.$/, ""))
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);
  const parent = parents.find((item) => host === item || host.endsWith(`.${item}`));
  if (!parent || host === parent) return null;
  const label = host.slice(0, -(parent.length + 1));
  if (!label || label.includes(".") || reserved.has(label) || !slugPattern.test(label)) return null;
  return label;
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
