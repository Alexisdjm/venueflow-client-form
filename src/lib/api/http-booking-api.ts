import type { BookingSelection } from "@/types/booking";
import { BookingApiError, type BookingApi } from "./booking-api";

function bookingBody(selection: BookingSelection) {
  const customer = {
    name: selection.customer.name,
    nationalId: selection.customer.nationalId,
    email: selection.customer.email,
    phone: selection.customer.phone,
  };
  const serviceIds = selection.services.map((service) => service.id);
  if (serviceIds.length < 2) {
    return {
      spaSlug: selection.spa.slug,
      serviceIds,
      start: selection.slot.start,
      customer,
      ...(selection.professionalId && selection.professionalId !== "any" ? { professionalId: selection.professionalId } : {}),
    };
  }
  return {
    spaSlug: selection.spa.slug,
    serviceIds,
    start: selection.slot.start,
    customer,
    sameProfessional: selection.assignmentMode === "same",
    items: selection.services.map((service) => {
      const chosen = selection.assignmentMode === "same"
        ? selection.professionalId
        : selection.assignmentMode === "each"
          ? selection.assignments?.[service.id]
          : undefined;
      return {
        serviceId: service.id,
        ...(chosen && chosen !== "any" ? { professionalId: chosen } : {}),
      };
    }),
  };
}

async function request<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
    ...init, headers: { "Content-Type": "application/json", ...init?.headers }, cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  const message = Array.isArray(payload.message) ? payload.message.join(". ") : payload.message;
  if (!response.ok) throw new BookingApiError(message ?? "No se pudo completar la solicitud", response.status, payload.code);
  return payload as T;
}

export function createHttpBookingApi(baseUrl: string): BookingApi {
  return {
    getSpa: (slug) => request(baseUrl, `/public/spas/${slug}`),
    getServices: (slug) => request(baseUrl, `/public/spas/${slug}/services`),
    getProfessionals: (slug, serviceIds) => request(baseUrl, `/public/spas/${slug}/professionals?serviceIds=${encodeURIComponent(serviceIds.join(","))}`),
    getAvailability: (input) => input.serviceIds.length > 1
      ? request(baseUrl, `/public/spas/${input.spaSlug}/sequence-availability`, {
          method: "POST",
          body: JSON.stringify({
            date: input.date,
            sameProfessional: Boolean(input.sameProfessional),
            items: (input.items ?? input.serviceIds.map((serviceId) => ({ serviceId }))).map((item) => ({
              serviceId: item.serviceId,
              ...(item.professionalId && item.professionalId !== "any" ? { professionalId: item.professionalId } : {}),
            })),
          }),
        })
      : request(baseUrl, `/public/spas/${input.spaSlug}/availability?${new URLSearchParams({ serviceIds: input.serviceIds.join(","), date: input.date, ...(input.professionalId && input.professionalId !== "any" ? { professionalId: input.professionalId } : {}) })}`),
    createBookingRequest: (selection) => request(baseUrl, `/public/booking-requests`, { method: "POST", body: JSON.stringify(bookingBody(selection)) }),
    resendVerification: (requestId) => request(baseUrl, `/public/booking-requests/${requestId}/resend`, { method: "POST" }),
    getVerificationDetails: (token) => request(baseUrl, `/public/booking-verifications/${encodeURIComponent(token)}`),
    confirmBooking: (token, idempotencyKey) => request(baseUrl, `/public/booking-verifications/${encodeURIComponent(token)}/confirm`, { method: "POST", headers: { "Idempotency-Key": idempotencyKey } }),
    cancelBooking: (token) => request(baseUrl, `/public/booking-verifications/${encodeURIComponent(token)}/cancel`, { method: "POST" }),
    getBookingConfirmation: (token) => request(baseUrl, `/public/booking-confirmations/${encodeURIComponent(token)}`),
    cancelConfirmedBooking: (token) => request(baseUrl, `/public/booking-confirmations/${encodeURIComponent(token)}/cancel`, { method: "POST" }),
  };
}
