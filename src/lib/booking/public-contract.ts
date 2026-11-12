import { BookingApiError } from "@/lib/api/booking-api";
import type { Service } from "@/types/booking";

const idempotencyKey = /^[\x21-\x7E]{1,128}$/;
const memoryKeys = new Map<string, string>();

export function bookableOnline(service: Service) {
  if (service.onlineBookable === false) return false;
  if (service.onlineBookable === true) return (service.durationMinutes ?? 0) > 0;
  return service.mode === "INSTANT" && service.durationMinutes != null;
}

export function formatWhen(value: string, timeZone = "UTC") {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

export function formatMoney(amount: number, currency = "USD") {
  if (currency === "USDT") {
    return `USDT ${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
  }
  try {
    return new Intl.NumberFormat("es-VE", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
  }
}

export function appointmentStatusLabel(status: string) {
  if (status === "COMPLETED") return "Completada";
  if (status === "CANCELLED") return "Cancelada";
  return "Confirmada";
}

function alias(token: string) {
  let hash = 0;
  for (let index = 0; index < token.length; index += 1) {
    hash = (Math.imul(31, hash) + token.charCodeAt(index)) | 0;
  }
  return (hash >>> 0).toString(16);
}

/** Reuses one confirmation key per verification link, including after reload. The link itself is not stored. */
export function stableIdempotencyKey(token: string) {
  const storageKey = `vf-confirm:${alias(token)}`;
  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved && idempotencyKey.test(saved)) return saved;
  } catch {
    const saved = memoryKeys.get(storageKey);
    if (saved) return saved;
  }
  const created = crypto.randomUUID();
  try {
    sessionStorage.setItem(storageKey, created);
  } catch {
    memoryKeys.set(storageKey, created);
  }
  return created;
}

export function publicErrorMessage(error: unknown, fallback: string) {
  if (error instanceof BookingApiError) {
    const message = error.message ?? "";
    if (error.status === 429) return message || "Demasiadas solicitudes. Espera un momento e intenta otra vez.";
    if (error.status === 410) return message || "Este enlace expiró. Elige el horario otra vez.";
    if (error.status === 404) return message || "No encontramos esta reserva.";
    if (error.status === 409 && /en línea/i.test(message) && /contacta al spa/i.test(message)) {
      return "No pudimos completar la reserva con los datos proporcionados. Contacta directamente al spa para recibir asistencia.";
    }
    if (error.status === 409) return message || "No se pudo completar la reserva. Revisa el horario o contacta al spa.";
    if (error.status === 400) return message || "Revisa los datos e intenta otra vez.";
    if ((error.status ?? 0) >= 500) return "El servicio no está disponible en este momento. Intenta más tarde.";
    if (message && !/prisma|postgres|\$\{/i.test(message)) return message;
  }
  if (error instanceof Error && /tardó demasiado|network|failed to fetch/i.test(error.message)) {
    return "No pudimos conectar. Puedes intentar de nuevo sin crear otra reserva.";
  }
  return fallback;
}
