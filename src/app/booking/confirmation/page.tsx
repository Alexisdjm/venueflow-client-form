import { Suspense } from "react";
import { ConfirmationRoute } from "@/components/booking/BookingTokenRoutes";
import { HostedConfirmation } from "@/components/booking/HostedTokenPages";

const demoSpa = { slug: "atelier-luma", name: "Atelier Luma" };

export default function ConfirmationPage() {
  if (process.env.NEXT_PUBLIC_BOOKING_MODE === "api") {
    return <Suspense fallback={<main aria-live="polite">Preparando comprobante…</main>}><HostedConfirmation /></Suspense>;
  }
  return <Suspense fallback={<main aria-live="polite">Preparando comprobante…</main>}>
    <ConfirmationRoute mode="demo" spa={demoSpa} />
  </Suspense>;
}
