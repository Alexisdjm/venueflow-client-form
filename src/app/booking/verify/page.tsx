import { Suspense } from "react";
import { notFound } from "next/navigation";
import { VerificationRoute } from "@/components/booking/BookingTokenRoutes";

const demoSpa = { slug: "atelier-luma", name: "Atelier Luma" };

export default function VerifyPage() {
  if (process.env.NEXT_PUBLIC_BOOKING_MODE === "api") notFound();
  return <Suspense fallback={<main aria-live="polite">Validando enlace…</main>}>
    <VerificationRoute mode="demo" spa={demoSpa} />
  </Suspense>;
}
