import { Suspense } from "react";
import { VerificationRoute } from "@/components/booking/BookingTokenRoutes";
export default function VerifyPage() {
  const mode = process.env.NEXT_PUBLIC_BOOKING_MODE === "api" ? "api" : "demo";
  return <Suspense fallback={<main aria-live="polite">Validando enlace…</main>}><VerificationRoute mode={mode} apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL} /></Suspense>;
}
