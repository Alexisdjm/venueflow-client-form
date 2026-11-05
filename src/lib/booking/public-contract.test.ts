import { BookingApiError } from "@/lib/api/booking-api";
import {
  bookableOnline,
  formatMoney,
  formatWhen,
  publicErrorMessage,
  stableIdempotencyKey,
} from "./public-contract";
import { describe, expect, it } from "@jest/globals";

const fixed = {
  id: "nails",
  name: "Manicure",
  description: "",
  category: "Uñas",
  durationMinutes: 60,
  price: 20,
  mode: "INSTANT" as const,
  onlineBookable: true,
};

describe("public booking contract", () => {
  it("blocks services the API marks as not bookable online", () => {
    expect(bookableOnline(fixed)).toBe(true);
    expect(bookableOnline({
      ...fixed,
      mode: "CONSULTATION_REQUIRED",
      onlineBookable: false,
      unavailableReason: "VARIABLE_PRICE",
    })).toBe(false);
    expect(bookableOnline({ ...fixed, mode: "ESTIMATED", durationMinutes: null, onlineBookable: undefined })).toBe(false);
  });

  it("formats money and spa-local time without shifting the instant", () => {
    expect(formatMoney(25.5, "USD")).toMatch(/25,50|25\.50/);
    expect(formatWhen("2030-01-15T14:30:00.000Z", "America/Caracas")).toMatch(/10:30/);
  });

  it("reuses one idempotency key for the same verification link", () => {
    sessionStorage.clear();
    const first = stableIdempotencyKey("verification-token");
    const second = stableIdempotencyKey("verification-token");
    expect(second).toBe(first);
    expect(stableIdempotencyKey("another-token")).not.toBe(first);
    expect(sessionStorage.getItem("vf-confirm:verification-token")).toBeNull();
  });

  it("turns an identity conflict into a generic message", () => {
    expect(publicErrorMessage(
      new BookingApiError("No se puede completar esta reserva en línea. Contacta al spa.", 409),
      "fallback",
    )).toBe("No pudimos completar la reserva con los datos proporcionados. Contacta directamente al spa para recibir asistencia.");
    expect(publicErrorMessage(new BookingApiError("El horario ya no esta disponible.", 409), "fallback")).toBe("El horario ya no esta disponible.");
    expect(publicErrorMessage(new BookingApiError("Podrás reenviar el correo en unos segundos.", 429), "fallback")).toMatch(/reenviar/);
  });
});
