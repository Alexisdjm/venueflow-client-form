import type { BookingApi } from "@/lib/api/booking-api";
import { createHttpBookingApi } from "@/lib/api/http-booking-api";
import { demoBookingApi } from "./demo-api";
import type { BookingMode } from "@/types/booking";

export function resolveBookingApi(mode: BookingMode, apiBaseUrl?: string, api?: BookingApi) {
  if (api) return api;
  if (mode === "demo") return demoBookingApi;
  if (!apiBaseUrl) throw new Error("apiBaseUrl es obligatorio en modo API");
  return createHttpBookingApi(apiBaseUrl);
}
