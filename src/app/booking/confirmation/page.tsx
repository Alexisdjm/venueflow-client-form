import { Suspense } from "react";
import { ConfirmationRoute } from "@/components/booking/BookingTokenRoutes";
export default function ConfirmationPage() {
  const mode = process.env.NEXT_PUBLIC_BOOKING_MODE === "api" ? "api" : "demo";
  return <Suspense fallback={<main aria-live="polite">Preparando comprobante…</main>}><ConfirmationRoute mode={mode} apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL} /></Suspense>;
}
