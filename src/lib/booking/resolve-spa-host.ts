import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BookingApiError } from "@/lib/api/booking-api";
import { createHttpBookingApi } from "@/lib/api/http-booking-api";
import type { Spa } from "@/types/booking";
import { bookingHostSuffixes, spaSlugFromRequestHeaders } from "./spa-host";

/** Resolves the spa from the request Host. Never falls back to a configured slug. */
export async function resolveRequestSpa(): Promise<Spa> {
  const slug = spaSlugFromRequestHeaders(await headers(), bookingHostSuffixes());
  if (!slug) notFound();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) notFound();
  try {
    const spa = await createHttpBookingApi(baseUrl).getSpa(slug);
    if (spa.slug !== slug) notFound();
    return spa;
  } catch (error) {
    if (error instanceof BookingApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}
