import { Suspense } from "react";
import { VerificationRoute } from "@/components/booking/BookingTokenRoutes";
import { HostedVerification } from "@/components/booking/HostedTokenPages";

const demoSpa = { slug: "atelier-luma", name: "Atelier Luma" };

export default function VerifyPage() {
  if (process.env.NEXT_PUBLIC_BOOKING_MODE === "api") {
    return <Suspense fallback={<main aria-live="polite">Validando enlace…</main>}><HostedVerification /></Suspense>;
  }
  return <Suspense fallback={<main aria-live="polite">Validando enlace…</main>}>
    <VerificationRoute mode="demo" spa={demoSpa} />
  </Suspense>;
}
