import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ConfirmationRoute } from "@/components/booking/BookingTokenRoutes";

const demoSpa = { slug: "atelier-luma", name: "Atelier Luma" };

export default function ConfirmationPage() {
  if (process.env.NEXT_PUBLIC_BOOKING_MODE === "api") notFound();
  return <Suspense fallback={<main aria-live="polite">Preparando comprobante…</main>}>
    <ConfirmationRoute mode="demo" spa={demoSpa} />
  </Suspense>;
}
